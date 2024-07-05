export function StatsCard(props: { label: string; value: any }) {
  return (
    <div className="border flex-grow-1 p-4">
      <div className="fs-5 fw-bold mb-4">{props.value}</div>
      <hr />
      <div className="text-muted">{props.label}</div>
    </div>
  );
}
