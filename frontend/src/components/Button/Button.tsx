type ButtonProps = {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'yellow' | 'success'
}

function Button({
  children,
  variant = 'primary',
}: ButtonProps) {

  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    yellow: 'bg-yellow-400 text-gray-900 hover:bg-yellow-500',
    success: 'bg-green-600 text-white hover:bg-green-700',
  }

  return (
    <button
      className={`rounded-lg px-6 py-3 font-medium transition ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

export default Button