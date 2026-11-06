import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { Participant } from '../../../../apis/participant.contract';
import { formatBmi, formatDate, formatMeasure } from './participant.formatter';

// Weight and height always show in lbs and in, whatever unit the participant entered:
// the headers carry the unit, so every row has to match it.
export function ParticipantsTable({ participants }: { participants: Participant[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Weight (lbs)</TableHead>
          <TableHead>Height (in)</TableHead>
          <TableHead>BMI (computed)</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell>{participant.firstName}</TableCell>
            <TableCell>{participant.email}</TableCell>
            <TableCell>{participant.phone}</TableCell>
            <TableCell>{formatMeasure(participant.weightInLbs)}</TableCell>
            <TableCell>{formatMeasure(participant.heightInInches)}</TableCell>
            <TableCell>{formatBmi(participant.bmi)}</TableCell>
            <TableCell>{formatDate(participant.creationDate)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
