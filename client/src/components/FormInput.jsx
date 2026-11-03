export default function FormInput({ label, name, error, as = 'input', children, ...props }) {
  const Tag = as
  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <Tag
        id={name}
        name={name}
        aria-invalid={!!error}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
        {...props}
      >
        {children}
      </Tag>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
