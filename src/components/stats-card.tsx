// export function StatsCard(props: { label: string; value: any }) {
//   return (
//     <div className="border border-2 flex-grow-1 p-4 rounded">
//       <div className="fs-5 fw-bold mb-4">{props.value}</div>
//       <hr />
//       <div className="text-muted">{props.label}</div>
//     </div>
//   );
// }

export function StatsCard(props: { label: string; value: any }) {
  return (
    <div className="bg-dark flex-grow-1 p-4 rounded text-primary">
      <div className="fs-5 fw-bold mb-4">{props.value}</div>
      <hr />
      <div className="fw-semibold">{props.label}</div>
    </div>
  );
}
