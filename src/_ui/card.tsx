interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm text-gray-800 text-left transition duration-150 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:cursor-pointer ${
        className || ""
      }`.trim()}
    >
      {children}
    </div>
  );
};
