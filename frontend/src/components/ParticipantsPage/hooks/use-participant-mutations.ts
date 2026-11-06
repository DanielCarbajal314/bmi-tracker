import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createParticipant } from '../apis/participant.api';
import { participantKeys } from './participant.keys';

export function useCreateParticipantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createParticipant,
    // Returning the promise keeps the mutation pending until the lists are refetched.
    onSuccess: () => {
      toast.success('Participant saved');
      return queryClient.invalidateQueries({ queryKey: participantKeys.all });
    },
  });
}
