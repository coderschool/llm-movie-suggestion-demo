export const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <h2 className="text-lg font-medium text-gray-600">{title}</h2>

      <div className="flex-grow border border-gray-300" />
    </div>
  );
};
