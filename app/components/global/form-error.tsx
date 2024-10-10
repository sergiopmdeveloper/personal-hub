import { cn } from '~/lib/utils';

/**
 * Form error component
 * @param {FormErrorProps} props - Component props
 * @param {React.ReactNode} props.children - Component children
 * @param {string} props.className - Additional component class names
 */
export function FormError({ children, className }: FormErrorProps) {
  return <p className={cn('text-xs text-red-500', className)}>{children}</p>;
}

/**
 * Form error component props
 */
type FormErrorProps = {
  children: React.ReactNode;
  className?: string;
};
