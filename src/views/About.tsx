'use client'

export default function About() {
  const steps = [
    ['Report', 'Log in and describe the problem with photos and a location.'],
    ['Review', 'An admin checks the report and sets its priority.'],
    ['Clean', 'A volunteer is assigned, cleans the spot, and uploads photos.'],
    ['Resolve', 'The admin verifies the work and marks the issue resolved.'],
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-12">
      <section>
        <h1 className="text-3xl font-bold text-primary">About Clean Community</h1>
        <p className="mt-3 text-muted-foreground">
          Clean Community lets residents report garbage dumping, overflowing dustbins, dirty public areas and
          drainage waste. Volunteers clean them up, and everyone can follow the progress in one place.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">How reporting works</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2">
          {steps.map(([title, text], i) => (
            <li key={title} className="rounded-lg border bg-white p-4">
              <span className="text-sm font-semibold text-primary">Step {i + 1}: {title}</span>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">How you can participate</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Report a problem you see in your area.</li>
          <li>Join a cleanup drive and meet your neighbours.</li>
          <li>Register as a volunteer to take on cleanup tasks.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Project team</h2>
        <p className="mt-3 text-muted-foreground">Team member names and roles will be added here.</p>
      </section>
    </div>
  )
}