import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { glucoseReadingSchema, type GlucoseReadingFormData } from '../utils/validation';
import { GLUCOSE_REFERENCE_VALUES, isGlucoseNormal } from '../utils/constants';
import type { GlucoseType } from '../utils/constants';
import { useGlucose } from '../hooks/useGlucose';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export function GlucoseForm() {
  const { createReading } = useGlucose();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<GlucoseReadingFormData>({
    resolver: zodResolver(glucoseReadingSchema),
    defaultValues: {
      value: undefined,
      type: 'JEJUM',
      date: new Date(),
      notes: '',
    },
  });

  const watchedValue = watch('value');
  const watchedType = watch('type') as GlucoseType;

  // Validação visual em tempo real
  const isValueNormal =
    watchedValue &&
    watchedType &&
    typeof watchedValue === 'number' &&
    isGlucoseNormal(watchedType, watchedValue);

  const onSubmit = async (data: GlucoseReadingFormData) => {
    try {
      setSubmitting(true);
      setSuccess(false);
      await createReading(data.value, data.type, data.date, data.notes);
      setSuccess(true);
      reset({
        value: undefined,
        type: 'JEJUM',
        date: new Date(),
        notes: '',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      alert(`Erro ao salvar o registro: ${errorMessage}\n\nVerifique o console para mais detalhes.`);
    } finally {
      setSubmitting(false);
    }
  };

  const reference = watchedType ? GLUCOSE_REFERENCE_VALUES[watchedType] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Glicemia</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
              Valor (mg/dL)
            </label>
            <div className="relative">
              <Input
                id="value"
                type="number"
                step="1"
                min="20"
                max="600"
                placeholder="Ex: 95"
                {...register('value', { valueAsNumber: true })}
                className={`pr-10 ${
                  watchedValue && watchedType
                    ? isValueNormal
                      ? 'border-success-500 focus-visible:ring-success-500'
                      : 'border-danger-500 focus-visible:ring-danger-500'
                    : ''
                }`}
              />
              {watchedValue && watchedType && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValueNormal ? (
                    <CheckCircle2 className="h-5 w-5 text-success-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-danger-500" />
                  )}
                </div>
              )}
            </div>
            {errors.value && (
              <p className="mt-1 text-sm text-danger-600">{errors.value.message}</p>
            )}
            {watchedValue && watchedType && reference && (
              <p className="mt-1 text-sm text-gray-600">
                Meta: {watchedType === 'JEJUM' ? '<' : '≤'} {reference.max} mg/dL
                {!isValueNormal && (
                  <span className="ml-2 text-danger-600 font-medium">
                    (Fora da meta)
                  </span>
                )}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Medição
            </label>
            <Select id="type" {...register('type')}>
              <option value="JEJUM">Jejum</option>
              <option value="POS_CAFE">Pós-Café</option>
              <option value="POS_ALMOCO">Pós-Almoço</option>
              <option value="POS_JANTAR">Pós-Jantar</option>
            </Select>
            {errors.type && (
              <p className="mt-1 text-sm text-danger-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora
            </label>
            <Input
              id="date"
              type="datetime-local"
              {...register('date', { valueAsDate: true })}
              defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-danger-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Observações (opcional)
            </label>
            <Input
              id="notes"
              type="text"
              placeholder="Ex: Após caminhada"
              {...register('notes')}
            />
          </div>

          {success && (
            <div className="p-3 bg-success-50 border border-success-200 rounded-md">
              <p className="text-sm text-success-800">
                Registro salvo com sucesso!
              </p>
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Salvando...' : 'Salvar Registro'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

