import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { Participant } from '../../../../apis/participant.contract';
import { formatDate, formatHeight, formatWeight } from './participant.formatter';

export function ParticipantsTable({ participants }: { participants: Participant[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>First name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Weight</TableHead>
          <TableHead>Height</TableHead>
          <TableHead>BMI</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell>{participant.id}</TableCell>
            <TableCell>{participant.firstName}</TableCell>
            <TableCell>{participant.email}</TableCell>
            <TableCell>{participant.phone}</TableCell>
            <TableCell>{formatWeight(participant)}</TableCell>
            <TableCell>{formatHeight(participant)}</TableCell>
            <TableCell className="font-medium">{participant.bmi}</TableCell>
            <TableCell>{formatDate(participant.creationDate)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
