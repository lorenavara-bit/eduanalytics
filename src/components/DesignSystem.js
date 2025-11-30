import React from 'react';

// ============================================
// BUTTON COMPONENT - Estilo Landing Page
// ============================================

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    className = '',
    type = 'button',
    fullWidth = false
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl focus:ring-blue-500',
        secondary: 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 shadow-md hover:shadow-lg focus:ring-blue-500',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
        success: 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl focus:ring-green-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl focus:ring-red-500',
        outline: 'bg-transparent border-2 border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm rounded-lg',
        md: 'px-6 py-3 text-base rounded-xl',
        lg: 'px-8 py-4 text-lg rounded-xl'
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        >
            {children}
        </button>
    );
};

// ============================================
// CARD COMPONENT - Estilo Landing Page
// ============================================

export const Card = ({
    children,
    variant = 'default',
    className = '',
    hover = false
}) => {
    const baseStyles = 'rounded-2xl overflow-hidden transition-all';

    const variantStyles = {
        default: 'bg-white shadow-lg border border-gray-200',
        gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl',
        feature: 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 shadow-md',
        glass: 'bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-lg'
    };

    const hoverStyles = hover ? 'hover:shadow-2xl hover:scale-105 cursor-pointer' : '';

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
        {children}
    </div>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={`px-6 py-4 ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
        {children}
    </div>
);

// ============================================
// INPUT COMPONENT - Estilo Landing Page
// ============================================

export const Input = ({
    type = 'text',
    placeholder = '',
    value,
    onChange,
    variant = 'default',
    size = 'md',
    icon,
    error = false,
    disabled = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        default: `border-2 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`,
        filled: `border-0 bg-gray-100 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm rounded-lg',
        md: 'px-6 py-3 text-base rounded-xl',
        lg: 'px-6 py-4 text-lg rounded-xl'
    };

    const iconPadding = icon ? 'pl-12' : '';

    return (
        <div className="relative">
            {icon && (
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full ${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${iconPadding} ${className}`}
                {...props}
            />
        </div>
    );
};

export const Textarea = ({
    placeholder = '',
    value,
    onChange,
    rows = 4,
    error = false,
    disabled = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'w-full transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl';
    const borderStyles = error
        ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    return (
        <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            disabled={disabled}
            className={`${baseStyles} ${borderStyles} px-6 py-3 ${className}`}
            {...props}
        />
    );
};

// ============================================
// BADGE COMPONENT
// ============================================

export const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    className = ''
}) => {
    const variantStyles = {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-blue-100 text-blue-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        danger: 'bg-red-100 text-red-700',
        gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-semibold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
            {children}
        </span>
    );
};

// ============================================
// ALERT COMPONENT
// ============================================

export const Alert = ({
    children,
    variant = 'info',
    icon,
    onClose,
    className = ''
}) => {
    const variantStyles = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800'
    };

    return (
        <div className={`rounded-xl border-2 p-4 flex items-start gap-3 ${variantStyles[variant]} ${className}`}>
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className="flex-1">{children}</div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:opacity-70 transition-opacity"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

// ============================================
// LOADING SPINNER
// ============================================

export const Spinner = ({ size = 'md', className = '' }) => {
    const sizeStyles = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div className={`${sizeStyles[size]} border-gray-200 border-t-blue-500 rounded-full animate-spin ${className}`}></div>
    );
};

// ============================================
// CONTAINER
// ============================================

export const Container = ({ children, className = '', size = 'default' }) => {
    const sizeStyles = {
        sm: 'max-w-4xl',
        default: 'max-w-7xl',
        lg: 'max-w-screen-2xl',
        full: 'max-w-full'
    };

    return (
        <div className={`${sizeStyles[size]} mx-auto px-6 ${className}`}>
            {children}
        </div>
    );
};

// ============================================
// SECTION (Para usar en páginas)
// ============================================

export const Section = ({ children, className = '', bgGradient = false }) => {
    const bgClass = bgGradient ? 'bg-gradient-page' : '';

    return (
        <section className={`py-16 ${bgClass} ${className}`}>
            {children}
        </section>
    );
};
