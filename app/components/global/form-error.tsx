/**
 * Form error component
 * @param {FormErrorProps} props - Component props
 * @param {React.ReactNode} props.children - Component children
 */
export function FormError({ children }: FormErrorProps) {
  return <p className="text-xs text-red-500">{children}</p>;
}

/**
 * Form error component props
 */
type FormErrorProps = {
  children: React.ReactNode;
};
