import type { Employee } from '@/types/models';

export function Avatar({ employee, size = 'size-10' }: { employee: Pick<Employee, 'name' | 'photoUrl'>; size?: string }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-info-600 to-primary-600 font-bold text-white`}>
      {employee.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={employee.photoUrl} alt="" className="size-full object-cover" />
      ) : (
        employee.name.charAt(0).toUpperCase()
      )}
    </span>
  );
}
