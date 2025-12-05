import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X,
    Edit2, Trash2, CheckCircle, Clock, AlertCircle, BookOpen, FileText, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Badge } from './DesignSystem';
import { useRole } from '../contexts/RoleContext';

const Calendar = () => {
    // Get session from context
    const { session, userProfile } = useRole();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        event_type: 'homework',
        subject: '',
        event_date: '',
        start_time: '',
        end_time: '',
        priority: 'medium',
        color: '#4F46E5',
        reminder_days: 1
    });

    const eventTypes = [
        { value: 'homework', label: 'Deberes', icon: '📚', color: '#3B82F6' },
        { value: 'exam', label: 'Examen', icon: '📝', color: '#EF4444' },
        { value: 'study_session', label: 'Sesión de Estudio', icon: '📖', color: '#8B5CF6' },
        { value: 'project', label: 'Proyecto', icon: '🎯', color: '#F59E0B' },
        { value: 'other', label: 'Otro', icon: '📌', color: '#6B7280' }
    ];

    const priorities = [
        { value: 'low', label: 'Baja', color: 'bg-gray-200 text-gray-800' },
        { value: 'medium', label: 'Media', color: 'bg-blue-200 text-blue-800' },
        { value: 'high', label: 'Alta', color: 'bg-red-200 text-red-800' }
    ];

    useEffect(() => {
        loadEvents();
    }, [currentDate]);

    const loadEvents = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const { data, error } = await supabase
                .from('calendar_events')
                .select('*')
                .eq('user_id', user.id)
                .gte('event_date', startOfMonth.toISOString().split('T')[0])
                .lte('event_date', endOfMonth.toISOString().split('T')[0])
                .order('event_date', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const saveEvent = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No autenticado');

            const eventData = {
                ...eventForm,
                user_id: user.id,
                color: eventTypes.find(t => t.value === eventForm.event_type)?.color || eventForm.color
            };

            if (editingEvent) {
                const { error } = await supabase
                    .from('calendar_events')
                    .update(eventData)
                    .eq('id', editingEvent.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('calendar_events')
                    .insert(eventData);
                if (error) throw error;
            }

            loadEvents();
            closeModal();
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Error al guardar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm('¿Eliminar este evento?')) return;
        try {
            const { error } = await supabase
                .from('calendar_events')
                .delete()
                .eq('id', id);
            if (error) throw error;
            loadEvents();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const toggleEventStatus = async (event) => {
        try {
            const newStatus = event.status === 'completed' ? 'pending' : 'completed';
            const { error } = await supabase
                .from('calendar_events')
                .update({ status: newStatus })
                .eq('id', event.id);
            if (error) throw error;
            loadEvents();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const openModal = (date = null, event = null) => {
        if (event) {
            setEditingEvent(event);
            setEventForm({
                title: event.title,
                description: event.description || '',
                event_type: event.event_type,
                subject: event.subject || '',
                event_date: event.event_date,
                start_time: event.start_time || '',
                end_time: event.end_time || '',
                priority: event.priority,
                color: event.color,
                reminder_days: event.reminder_days || 1
            });
        } else {
            setEditingEvent(null);
            setEventForm({
                title: '',
                description: '',
                event_type: 'homework',
                subject: '',
                event_date: date ? date.toISOString().split('T')[0] : '',
                start_time: '',
                end_time: '',
                priority: 'medium',
                color: '#4F46E5',
                reminder_days: 1
            });
        }
        setShowEventModal(true);
    };

    const closeModal = () => {
        setShowEventModal(false);
        setEditingEvent(null);
    };

    // Calendar rendering logic
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        // Previous month's days
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const getEventsForDate = (date) => {
        if (!date) return [];
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(e => e.event_date === dateStr);
    };

    const getUpcomingEvents = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const next7Days = new Date(today);
        next7Days.setDate(next7Days.getDate() + 7);

        return events.filter(e => {
            const eventDate = new Date(e.event_date);
            return eventDate >= today && eventDate <= next7Days && e.status !== 'completed';
        }).sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    };

    const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const days = getDaysInMonth(currentDate);
    const upcomingEvents = getUpcomingEvents();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <CalendarIcon className="h-8 w-8 mr-3 text-indigo-600" />
                        Mi Agenda
                    </h1>
                    <p className="text-gray-600 mt-1">Organiza tus deberes, exámenes y estudio</p>
                </div>
                <Button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="h-5 w-5 mr-2" />
                    Nuevo Evento
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Calendar */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Button
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                                    variant="ghost"
                                    size="sm"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <h2 className="text-xl font-bold capitalize">{monthName}</h2>
                                <Button
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                                    variant="ghost"
                                    size="sm"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                    <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {days.map((date, idx) => {
                                    const dayEvents = date ? getEventsForDate(date) : [];
                                    const isToday = date && date.toDateString() === new Date().toDateString();
                                    const isPast = date && date < new Date() && !isToday;

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => date && openModal(date)}
                                            className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all ${!date ? 'bg-gray-50 cursor-default' :
                                                isToday ? 'border-indigo-600 bg-indigo-50' :
                                                    isPast ? 'bg-gray-50 opacity-60' :
                                                        'hover:bg-gray-50 hover:border-indigo-300'
                                                }`}
                                        >
                                            {date && (
                                                <>
                                                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                                                        {date.getDate()}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {dayEvents.slice(0, 2).map(event => {
                                                            const eventType = eventTypes.find(t => t.value === event.event_type);
                                                            return (
                                                                <div
                                                                    key={event.id}
                                                                    className="text-xs px-1 py-0.5 rounded truncate"
                                                                    style={{ backgroundColor: event.color + '20', color: event.color }}
                                                                    title={event.title}
                                                                >
                                                                    {eventType?.icon} {event.title}
                                                                </div>
                                                            );
                                                        })}
                                                        {dayEvents.length > 2 && (
                                                            <div className="text-xs text-gray-500">+{dayEvents.length - 2} más</div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Upcoming Events */}
                <div className="space-y-6">
                    {/* Upcoming events */}
                    <Card>
                        <CardHeader>
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                                Próximos 7 Días
                            </h3>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No tienes eventos próximos 🎉
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingEvents.map(event => {
                                        const eventType = eventTypes.find(t => t.value === event.event_type);
                                        const daysUntil = Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24));

                                        return (
                                            <div
                                                key={event.id}
                                                className="p-3 border-l-4 bg-gray-50 rounded"
                                                style={{ borderColor: event.color }}
                                            >
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{eventType?.icon}</span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                                                            <p className="text-xs text-gray-600">{event.subject}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => toggleEventStatus(event)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className={event.status === 'completed' ? 'text-green-600' : 'text-gray-400'}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">
                                                        {daysUntil === 0 ? '¡Hoy!' : daysUntil === 1 ? 'Mañana' : `En ${daysUntil} días`}
                                                    </span>
                                                    <Badge className={priorities.find(p => p.value === event.priority)?.color}>
                                                        {priorities.find(p => p.value === event.priority)?.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Legend */}
                    <Card>
                        <CardHeader>
                            <h3 className="font-bold text-gray-900">Leyenda</h3>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {eventTypes.map(type => (
                                    <div key={type.value} className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: type.color }}></div>
                                        <span className="text-sm">{type.icon} {type.label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">
                                    {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
                                </h2>
                                <Button onClick={closeModal} variant="ghost" size="sm">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        value={eventForm.title}
                                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="ej: Entregar trabajo de Ciencias"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Evento *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {eventTypes.map(type => (
                                            <button
                                                key={type.value}
                                                onClick={() => setEventForm({ ...eventForm, event_type: type.value })}
                                                className={`p-3 border-2 rounded-lg transition-all ${eventForm.event_type === type.value
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-indigo-300'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-1">{type.icon}</div>
                                                <div className="text-sm font-medium">{type.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Asignatura
                                    </label>
                                    <input
                                        type="text"
                                        value={eventForm.subject}
                                        onChange={(e) => setEventForm({ ...eventForm, subject: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="ej: Matemáticas"
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha *
                                    </label>
                                    <input
                                        type="date"
                                        value={eventForm.event_date}
                                        onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>

                                {/* Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hora Inicio
                                        </label>
                                        <input
                                            type="time"
                                            value={eventForm.start_time}
                                            onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hora Fin
                                        </label>
                                        <input
                                            type="time"
                                            value={eventForm.end_time}
                                            onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md"
                                        />
                                    </div>
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prioridad
                                    </label>
                                    <div className="flex gap-2">
                                        {priorities.map(priority => (
                                            <button
                                                key={priority.value}
                                                onClick={() => setEventForm({ ...eventForm, priority: priority.value })}
                                                className={`px-4 py-2 rounded-lg border-2 transition-all ${eventForm.priority === priority.value
                                                    ? priority.color + ' border-current'
                                                    : 'border-gray-200 text-gray-700'
                                                    }`}
                                            >
                                                {priority.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={eventForm.description}
                                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        rows={3}
                                        placeholder="Detalles adicionales..."
                                    />
                                </div>

                                {/* Reminder */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Recordar con antelación
                                    </label>
                                    <select
                                        value={eventForm.reminder_days}
                                        onChange={(e) => setEventForm({ ...eventForm, reminder_days: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value={0}>El mismo día</option>
                                        <option value={1}>1 día antes</option>
                                        <option value={2}>2 días antes</option>
                                        <option value={3}>3 días antes</option>
                                        <option value={7}>1 semana antes</option>
                                    </select>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={saveEvent}
                                        disabled={!eventForm.title || !eventForm.event_date || loading}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {loading ? 'Guardando...' : editingEvent ? 'Actualizar' : 'Guardar'}
                                    </Button>
                                    {editingEvent && (
                                        <Button
                                            onClick={() => {
                                                deleteEvent(editingEvent.id);
                                                closeModal();
                                            }}
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar
                                        </Button>
                                    )}
                                    <Button onClick={closeModal} variant="outline">
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
