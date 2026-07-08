import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export function useEbooks() {
  return useQuery({
    queryKey: ['ebooks'],
    queryFn: async () => {
      const { data } = await api.get('/ebooks');
      return data;
    }
  });
}

export function useEbook(id) {
  return useQuery({
    queryKey: ['ebook', id],
    queryFn: async () => {
      const { data } = await api.get(`/ebooks/${id}`);
      return data;
    },
    enabled: !!id
  });
}

export function useCreateEbook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookData) => {
      const { data } = await api.post('/ebooks', bookData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
    }
  });
}

export function useUpdateEbook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const { data } = await api.put(`/ebooks/${id}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ebook', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['ebooks'] });
    }
  });
}

export function useCreateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chapterData) => {
      const { data } = await api.post('/chapters', chapterData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ebook', variables.bookId] });
    }
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const { data } = await api.put(`/chapters/${id}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the book to refetch chapters
      queryClient.invalidateQueries({ queryKey: ['ebook'] });
    }
  });
}
