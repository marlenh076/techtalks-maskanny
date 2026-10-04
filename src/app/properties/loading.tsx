export default function Loading() {
  return (
    <main className="student-marketplace min-h-screen bg-[var(--bg)] px-4 py-10 text-[var(--ink)] md:px-6">
      <div className="mx-auto max-w-[1184px] animate-pulse">
        <div className="h-10 w-72 rounded-[12px] bg-[var(--placeholder-bg)]" />
        <div className="mt-8 h-72 rounded-3xl bg-[var(--surface)]" />
        <div className="mt-8 grid grid-cols-1 gap-[18px] md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-[380px] rounded-3xl bg-[var(--surface)]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
