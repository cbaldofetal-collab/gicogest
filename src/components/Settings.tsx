import { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Bell, BellOff } from 'lucide-react';

export function Settings() {
  const { config, permission, loading, requestPermission, saveConfig } = useNotifications();
  const [localConfig, setLocalConfig] = useState(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleToggleReminder = (key: keyof NonNullable<typeof localConfig>) => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      [key]: {
        ...localConfig[key],
        enabled: !localConfig[key].enabled,
      },
    });
  };

  const handleTimeChange = (key: keyof NonNullable<typeof localConfig>, time: string) => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      [key]: {
        ...localConfig[key],
        time,
      },
    });
  };

  const handleSave = async () => {
    if (!localConfig) return;
    try {
      setSaving(true);
      await saveConfig(localConfig);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      alert('Permissão concedida! Os lembretes serão exibidos nos horários configurados.');
    } else {
      alert('Permissão negada. Você não receberá notificações de lembretes.');
    }
  };

  if (loading || !localConfig) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Lembretes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission !== 'granted' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 mb-3">
              As notificações estão desativadas. Ative para receber lembretes.
            </p>
            <Button onClick={handleRequestPermission} variant="outline" size="sm">
              Ativar Notificações
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {(['jejum', 'posCafe', 'posAlmoco', 'posJantar'] as Array<keyof NonNullable<typeof localConfig>>).map((key) => {
            const reminder = localConfig![key];
            const labels = {
              jejum: 'Jejum',
              posCafe: 'Pós-Café',
              posAlmoco: 'Pós-Almoço',
              posJantar: 'Pós-Jantar',
            };

            return (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {reminder.enabled ? (
                      <Bell className="h-4 w-4 text-primary-600" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="font-medium">{labels[key]}</span>
                  </div>
                  <Input
                    type="time"
                    value={reminder.time}
                    onChange={(e) => handleTimeChange(key, e.target.value)}
                    disabled={!reminder.enabled}
                    className="w-32"
                  />
                </div>
                <Button
                  variant={reminder.enabled ? 'default' : 'outline'}
                  onClick={() => handleToggleReminder(key)}
                  className="ml-4"
                >
                  {reminder.enabled ? 'Ativo' : 'Inativo'}
                </Button>
              </div>
            );
          })}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
}

