import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { PaginatedData } from '@/types/finance';

const breadcrumbs = [
  { title: 'Notifications', href: '/notifications' },
  { title: 'Templates', href: '/notifications/templates' },
];

interface NotificationTemplate {
  id: number;
  name: string;
  type: string;
  channel: string;
  subject?: string;
  body: string;
  variables?: string[];
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

interface Props {
  templates: PaginatedData<NotificationTemplate>;
  availableTypes: Record<string, any[]>;
}

export default function Index({ templates, availableTypes }: Props) {
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      router.delete(`/notifications/templates/${id}`, {
        onSuccess: () => {
          router.reload({ only: ['templates'] });
        },
      });
    }
  };

  const getChannelBadgeColor = (channel: string) => {
    const colors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      email: 'default',
      sms: 'secondary',
      push: 'outline',
      database: 'destructive',
    };
    return colors[channel] || 'default';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notification Templates" />

      <div className="mx-auto max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notification Templates</h1>
            <p className="text-muted-foreground mt-2">
              Manage templates for different notification types and channels
            </p>
          </div>
          <Button asChild>
            <Link href="/notifications/templates/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Templates</CardTitle>
            <CardDescription>
              {templates.meta.total} template{templates.meta.total !== 1 ? 's' : ''} available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No templates found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first template to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.data.map((template) => (
                  <div
                    key={template.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant={template.is_active ? 'default' : 'secondary'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {template.is_default && <Badge variant="outline">Default</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <code className="rounded bg-muted px-2 py-0.5 text-xs">
                          {template.type}
                        </code>
                        <span>•</span>
                        <Badge variant={getChannelBadgeColor(template.channel)}>
                          {template.channel}
                        </Badge>
                        {template.subject && (
                          <>
                            <span>•</span>
                            <span className="truncate">{template.subject}</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{template.body}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/notifications/templates/${template.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

