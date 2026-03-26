/**
 * Placeholder Button component
 * Use this as a template for creating new components
 */

function Button({ children, onClick, variant = 'primary', ...props }) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;

  return (
    <button className={`${baseClass} ${variantClass}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

export default Button;
