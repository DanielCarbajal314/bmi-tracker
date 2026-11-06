import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BmiFilter } from './components/BmiFilter';
import { Pagination } from './components/Pagination';
import { ParticipantsTable } from './components/ParticipantsTable';
import { useParticipantsList } from './hooks/use-participants-list';

export function ParticipantsList() {
  const list = useParticipantsList();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>Newest first. Filter by BMI to narrow the list.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <BmiFilter onApply={list.applyFilter} onClear={list.clearFilter} />

        {list.view === 'loading' && (
          <p role="status" className="text-sm text-muted-foreground">
            Loading participants…
          </p>
        )}

        {list.view === 'error' && (
          <div role="alert" className="flex flex-wrap items-center gap-3 text-sm">
            <p className="text-destructive">Could not load participants: {list.errorMessage}</p>
            <Button type="button" variant="outline" size="sm" onClick={list.retry}>
              Retry
            </Button>
          </div>
        )}

        {list.view === 'empty' && (
          <p className="text-sm text-muted-foreground">No participants found.</p>
        )}

        {list.view === 'ready' && (
          <>
            <ParticipantsTable participants={list.participants} />
            <Pagination
              page={list.page}
              totalPages={list.totalPages}
              total={list.total}
              onPageChange={list.goToPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
