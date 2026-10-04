/** A sentence where the parts between `backticks` are shown as code (copy files keep the markup out). */
export function WithCode({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}
    </>
  );
}
