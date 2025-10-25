// Utility to wrap settings pages to Tailwind context and avoid legacy CSS
export const withTW = (Component) => (props) => (
  <div className="tw">
    <Component {...props} />
  </div>
);
