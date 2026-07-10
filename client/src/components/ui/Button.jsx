import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500',
  secondary: 'bg-violet-600 hover:bg-violet-500 text-white focus:ring-violet-500',
  danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
  success: 'bg-green-600 hover:bg-green-500 text-white focus:ring-green-500',
  ghost: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 focus:ring-white/20',
  warning: 'bg-yellow-600 hover:bg-yellow-500 text-white focus:ring-yellow-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
  xl: 'px-8 py-4 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
