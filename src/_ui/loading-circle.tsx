interface LoadingCircleProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

export const LoadingCircle = ({
  size = "medium",
  color = "border-gray-900",
}: LoadingCircleProps) => {
  return (
    <div
      className={`w-4 h-4 border-t-2 border-b-2 ${color} rounded-full animate-spin ${
        size === "small" ? "w-2 h-2" : size === "large" ? "w-6 h-6" : ""
      }`}
    ></div>
  );
};
