export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          VoteBoard
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Submit product ideas and vote on the features you want most.
        </p>
      </div>

      <div className="mt-12 flex items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-sm text-muted-foreground">
          The idea board will appear here (PROJ-2).
        </p>
      </div>
    </div>
  )
}
