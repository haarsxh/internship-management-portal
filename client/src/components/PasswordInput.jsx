import { useState } from 'react'
import FormInput from './FormInput'

// Password field with a show/hide toggle
export default function PasswordInput({ label, name, error, ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <FormInput label={label} name={name} error={error} type={show ? 'text' : 'password'} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-4 top-[34px] text-xs text-indigo-700 hover:underline"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}
