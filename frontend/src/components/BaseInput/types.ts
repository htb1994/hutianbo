export type BaseInputSize = 'sm' | 'md' | 'lg'

export interface BaseInputProps {
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
  size?: BaseInputSize
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
}
