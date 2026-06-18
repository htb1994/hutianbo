export type BaseButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type BaseButtonSize = 'sm' | 'md' | 'lg'

export interface BaseButtonProps {
  variant?: BaseButtonVariant
  size?: BaseButtonSize
  loading?: boolean
  disabled?: boolean
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
}
