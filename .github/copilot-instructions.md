# GitHub Copilot Instructions

## Project Structure Rules

### Feature-Based Organization
Organize code by feature within Laravel's standard folders:

```
app/
├── Models/[Feature]/          # Eloquent models grouped by feature
├── Http/
│   ├── Controllers/[Feature]/ # Controllers grouped by feature
│   └── Resources/[Feature]/   # API Resources for JSON responses
├── Services/[Feature]/        # Business logic services
├── Repositories/              # Query-only repositories
│   ├── BaseRepository.php     # Base repository with CRUD methods
│   └── [Feature]/             # Feature-specific repositories
├── Contracts/[Feature]/       # Interfaces for dependency injection
├── Enums/[Feature]/           # Enum classes for type safety
├── Events/[Feature]/          # Domain events
├── Jobs/[Feature]/            # Background jobs
├── Strategies/[Feature]/      # Strategy pattern implementations
├── Factories/[Feature]/       # Factory pattern implementations
└── Console/Commands/[Feature]/ # Artisan commands
```

### Current Features
- **Calendar**: Calendar events and reminders management
- **Notification**: Multi-channel notification system with templates
- **Tools**: Utility tools (encoder/decoder, etc.)

### Namespace Convention
Follow PSR-4 autoloading with feature grouping:
- `App\Models\Calendar\CalendarEvent`
- `App\Http\Controllers\Calendar\CalendarController`
- `App\Http\Resources\Calendar\CalendarEventResource`
- `App\Services\Calendar\CalendarService`
- `App\Repositories\Calendar\CalendarRepository`
- `App\Contracts\Calendar\CalendarServiceInterface`
- `App\Enums\Calendar\EventType`

## Architecture Patterns

### Repository Pattern (Query Only)

**ALL Repositories MUST extend `BaseRepository`:**

```php
<?php

declare(strict_types=1);

namespace App\Repositories\Calendar;

use App\Models\Calendar\CalendarEvent;
use App\Repositories\BaseRepository;

final class CalendarRepository extends BaseRepository
{
    public function __construct()
    {
        $this->model = new CalendarEvent();
    }

    // Custom query methods only
    public function getEventsByUserAndMonth(int $userId, string $month): array
    {
        // Custom query logic
    }
}
```

**BaseRepository provides:**
- `findById(int $id): ?Model`
- `findByIdOrFail(int $id): Model`
- `findBy(string $column, mixed $value): ?Model`
- `getAll(): Collection`
- `getAllWith(array $relations): Collection`
- `paginate(int $perPage = 15): LengthAwarePaginator`
- `paginateWith(array $relations, int $perPage = 15): LengthAwarePaginator`
- `count(): int`
- `countBy(string $column, mixed $value): int`
- `exists(int $id): bool`
- `existsBy(string $column, mixed $value): bool`
- `getWhere(string $column, mixed $value): Collection`
- `getWhereWith(string $column, mixed $value, array $relations): Collection`
- `firstWhere(string $column, mixed $value): ?Model`
- `getOrderedBy(string $column, string $direction = 'asc'): Collection`
- `getLatest(int $limit = 10): Collection`

**Repositories MUST only contain read operations:**
```php
// ✅ CORRECT
public function findByUuid(string $uuid): ?Model;
public function getAllActive(): Collection;
public function getPaginatedByUser(int $userId, int $perPage = 15): LengthAwarePaginator;
public function getEventsByUserAndMonth(int $userId, string $month): array;

// ❌ WRONG - No write operations in repositories
public function create(array $data);
public function update(Model $model, array $data);
public function delete(Model $model);
```

### Service Pattern (Business Logic + Writes)

Services contain all business logic and write operations, delegating queries to repositories:

```php
<?php

declare(strict_types=1);

namespace App\Services\Calendar;

use App\Contracts\Calendar\CalendarRepositoryInterface;
use App\Contracts\Calendar\CalendarServiceInterface;
use App\Models\Calendar\CalendarEvent;

final class CalendarService implements CalendarServiceInterface
{
    public function __construct(
        private readonly CalendarRepositoryInterface $repository,
    ) {}

    // ✅ CORRECT - Services handle creates, updates, deletes
    public function createEvent(int $userId, array $data): CalendarEvent
    {
        $data['user_id'] = $userId;
        return CalendarEvent::create($data);
    }

    public function updateEvent(CalendarEvent $event, array $data): CalendarEvent
    {
        $event->update($data);
        return $event->fresh();
    }

    public function deleteEvent(CalendarEvent $event): bool
    {
        return (bool) $event->delete();
    }

    // ✅ CORRECT - Services delegate reads to repository
    public function getEventsByMonth(int $userId, string $month): array
    {
        return $this->repository->getEventsByUserAndMonth($userId, $month);
    }
}
```

### Controller Pattern (Thin HTTP Layer)

Controllers MUST remain thin - handle HTTP concerns only, use API Resources for responses:

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Http\Resources\Calendar\CalendarEventResource;
use App\Contracts\Calendar\CalendarRepositoryInterface;
use App\Contracts\Calendar\CalendarServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CalendarController extends Controller
{
    public function __construct(
        private readonly CalendarRepositoryInterface $repository,
        private readonly CalendarServiceInterface $service,
    ) {}

    // ✅ CORRECT - Use Resources for API responses
    public function index(Request $request): JsonResponse
    {
        $events = $this->repository->getPaginatedByUser(
            auth()->id(),
            $request->integer('per_page', 15)
        );

        return CalendarEventResource::collection($events)
            ->response();
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([...]);
        $event = $this->service->createEvent(auth()->id(), $validated);

        return CalendarEventResource::make($event)
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): JsonResponse
    {
        $event = $this->repository->findByIdAndUser($id, auth()->id());

        if (!$event) {
            abort(404);
        }

        return CalendarEventResource::make($event->load('reminders'))
            ->response();
    }
}
```

### API Resources Pattern

**ALWAYS use API Resources for API responses** - never return raw models or arrays:

```php
<?php

declare(strict_types=1);

namespace App\Http\Resources\Calendar;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarEventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'start_date' => $this->start_date?->toISOString(),
            'end_date' => $this->end_date?->toISOString(),
            'type' => $this->type,  // Enum will be serialized automatically
            'color' => $this->color,
            'is_all_day' => $this->is_all_day,
            'reminders' => CalendarReminderResource::collection($this->whenLoaded('reminders')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
```

**Using Resources in Controllers:**
```php
// Single resource
return CalendarEventResource::make($event)->response();

// Collection
return CalendarEventResource::collection($events)->response();

// Paginated collection (automatic pagination links)
return CalendarEventResource::collection($paginatedEvents)->response();

// With metadata
return CalendarEventResource::collection($events)
    ->additional(['meta' => ['total' => $events->count()]])
    ->response();
```

### Enum Pattern

**MUST use PHP 8.1+ Enums for fixed values** - provides type safety and IDE autocomplete:

```php
<?php

declare(strict_types=1);

namespace App\Enums\Calendar;

enum EventType: string
{
    case CUSTOM = 'custom';
    case REMINDER = 'reminder';
    case PAYMENT_DUE = 'payment_due';

    /**
     * Get all values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get label for display
     */
    public function label(): string
    {
        return match ($this) {
            self::CUSTOM => 'Custom Event',
            self::REMINDER => 'Reminder',
            self::PAYMENT_DUE => 'Payment Due',
        };
    }
}
```

**Using Enums in Models:**
```php
final class CalendarEvent extends Model
{
    protected $casts = [
        'type' => EventType::class,      // Auto-cast to Enum
        'color' => EventColor::class,
        'status' => EventStatus::class,
    ];
}
```

**Using Enums in Validation:**
```php
use App\Enums\Calendar\EventType;

$request->validate([
    'type' => ['required', 'string', 'in:' . implode(',', EventType::values())],
]);

// Or using Rule
use Illuminate\Validation\Rule;

$request->validate([
    'type' => ['required', Rule::enum(EventType::class)],
]);
```

**Using Enums in Code:**
```php
// Comparison
if ($event->type === EventType::CUSTOM) {
    // ...
}

// Get label
$label = $event->type->label();

// Get all values
$allTypes = EventType::values();
```

## Pagination

**MUST use Laravel's built-in pagination:**

```php
// In Repository
public function getPaginatedByUser(int $userId, int $perPage = 15): LengthAwarePaginator
{
    return CalendarEvent::where('user_id', $userId)
        ->orderBy('created_at', 'desc')
        ->with('reminders')
        ->paginate($perPage);
}

// In Controller
public function index(Request $request): JsonResponse
{
    $perPage = $request->integer('per_page', 15);  // Default 15
    $events = $this->repository->getPaginatedByUser(auth()->id(), $perPage);

    // Resource automatically handles pagination metadata
    return CalendarEventResource::collection($events)->response();
}
```

**Pagination Response Format (automatic):**
```json
{
    "data": [...],
    "links": {
        "first": "http://example.com/api/events?page=1",
        "last": "http://example.com/api/events?page=10",
        "prev": null,
        "next": "http://example.com/api/events?page=2"
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 10,
        "per_page": 15,
        "to": 15,
        "total": 150
    }
}
```

## SOLID Principles

### Dependency Injection
Always use constructor injection with interfaces:
```php
public function __construct(
    private readonly CalendarRepositoryInterface $repository,
    private readonly CalendarServiceInterface $service,
) {}
```

### Interface Segregation
Create focused interfaces in `Contracts/[Feature]/`:
- `CalendarRepositoryInterface` - query methods
- `CalendarServiceInterface` - business logic methods
- `NotificationServiceInterface` - notification operations

### Single Responsibility
- **Models**: Data representation + relationships + casts only
- **Controllers**: HTTP request/response handling only
- **Services**: Business logic + orchestration + writes
- **Repositories**: Database queries (reads only)
- **Resources**: JSON transformation for APIs
- **Enums**: Fixed value sets with helper methods
- **Jobs**: Background task execution
- **Events**: Domain event broadcasting

## Naming Conventions

### Files
- **Models**: `{Entity}.php` (e.g., `CalendarEvent.php`)
- **Controllers**: `{Entity}Controller.php` (e.g., `CalendarController.php`)
- **Services**: `{Entity}Service.php` (e.g., `CalendarService.php`)
- **Repositories**: `{Entity}Repository.php` (e.g., `CalendarRepository.php`)
- **Resources**: `{Entity}Resource.php` (e.g., `CalendarEventResource.php`)
- **Enums**: `{Name}.php` (e.g., `EventType.php`, `NotificationStatus.php`)
- **Interfaces**: `{Purpose}Interface.php` (e.g., `CalendarServiceInterface.php`)
- **Events**: `{Action}Event.php` (e.g., `EventCreated.php`)
- **Jobs**: `{Action}Job.php` (e.g., `SendReminderJob.php`)

### Methods
- **Repository queries**: `find*`, `get*`, `count*`, `exists*`, `paginate*`
- **Service writes**: `create*`, `update*`, `delete*`, `process*`
- **Service reads**: delegate to repository methods
- **Controllers**: `index`, `store`, `show`, `update`, `destroy`
- **Resource transformation**: `toArray(Request $request): array`

## Database Conventions

### Migrations
- Prefix with date: `2026_01_10_100000_create_calendar_events_table.php`
- Use descriptive names
- Add indexes for foreign keys and frequently queried columns
- Use proper column types matching Enum backing values

### Models

**MUST specify fillable, casts, and relationships:**

```php
<?php

declare(strict_types=1);

namespace App\Models\Calendar;

use App\Enums\Calendar\EventType;
use App\Enums\Calendar\EventColor;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class CalendarEvent extends Model
{
    // Always specify fillable
    protected $fillable = [
        'user_id',
        'title',
        'type',
        'color',
        'start_date',
        'end_date',
        'is_all_day',
        'metadata',
    ];

    // Use casting for proper types - use Enums where applicable
    protected $casts = [
        'type' => EventType::class,           // Enum casting
        'color' => EventColor::class,         // Enum casting
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_all_day' => 'boolean',
        'metadata' => 'array',
    ];

    // Define relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(CalendarReminder::class);
    }
}
```

**Model Best Practices:**
- Use `final` keyword unless designed for extension
- Use typed properties where beneficial (PHP 8+)
- Use Enums for status, type, and other fixed value fields
- Cast dates to `datetime` for proper Carbon instances
- Cast booleans explicitly
- Cast JSON fields to `array`
- Define all relationships explicitly
- Use `BelongsTo`, `HasMany`, `HasOne`, `MorphTo`, etc. return types

## Code Quality Rules

### Type Declarations
Always use strict types and return type declarations:
```php
declare(strict_types=1);

public function createEvent(int $userId, array $data): CalendarEvent
{
    // ...
}

public function getPaginatedByUser(int $userId, int $perPage = 15): LengthAwarePaginator
{
    // ...
}
```

### Validation
- Validate in controllers using FormRequest or inline validation
- Never trust user input
- Use Laravel's validation rules
- Use Enum validation with `Rule::enum()`
- Always validate pagination parameters

```php
$request->validate([
    'title' => 'required|string|max:255',
    'type' => ['required', Rule::enum(EventType::class)],
    'color' => ['required', Rule::enum(EventColor::class)],
    'per_page' => 'nullable|integer|min:1|max:100',
]);
```

### Error Handling
- Throw specific exceptions
- Use try-catch in controllers when needed
- Return appropriate HTTP status codes
- Use proper error messages
- Return errors in consistent format via API Resources

### Testing
- Write tests in `tests/Feature/` and `tests/Unit/`
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies
- Test with various Enum values
- Test pagination edge cases

## When Adding New Features or Refactoring

### Pre-Development Review (MANDATORY)
Before starting any feature development or refactoring, **MUST** review the specific functionality:

1. **Define Scope & Responsibilities**
   - What exact functionality does this feature/refactor provide?
   - Which components/layers does it affect?
   - What are the integration points?

2. **Verify Architecture**
   - Does it follow the repository/service/controller pattern?
   - Are there any existing patterns to follow?
   - Is the feature-based organization appropriate?
   - What Enums are needed?
   - What API Resources are needed?

3. **Check Existing Code**
   - Are there similar features already implemented?
   - Can we reuse existing utilities, hooks, or components?
   - Should this be shared or feature-specific?
   - Review existing Enums that might be reusable

4. **Plan File Structure**
   - Create all necessary folders in advance
   - Map out which interfaces/contracts are needed
   - Identify shared vs feature-specific code
   - Plan Enum structure
   - Plan API Resource structure

### Implementation Steps

1. **Create Enums**: Define in `app/Enums/[Feature]/`
2. **Create folder structure**: `app/Models/[Feature]/`, `app/Services/[Feature]/`, etc.
3. **Define contracts**: Create interfaces in `app/Contracts/[Feature]/`
4. **Implement models**: Add to `app/Models/[Feature]/` with Enum casts
5. **Create repositories**: Extend BaseRepository in `app/Repositories/[Feature]/`
6. **Create services**: Business logic in `app/Services/[Feature]/` using repositories
7. **Create API Resources**: JSON transformations in `app/Http/Resources/[Feature]/`
8. **Add controllers**: Thin HTTP layer in `app/Http/Controllers/[Feature]/` using Resources
9. **Register bindings**: Update service provider with interface bindings
10. **Define routes**: Add to `routes/api.php` or `routes/web.php`
11. **Create migrations**: Database schema changes with proper Enum column types
12. **Write tests**: Feature and unit tests covering Enums and Resources

## Frontend (React + Inertia.js)

### Component Organization
```
resources/js/
├── Pages/[Feature]/     # Inertia pages
├── Components/[Feature]/ # Reusable components
├── components/ui/       # Shadcn/ui components (use directly)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities (cn, toUrl)
└── types/               # TypeScript types
```

### Naming
- Pages: PascalCase (e.g., `Index.jsx`, `Create.jsx`)
- Components: PascalCase (e.g., `WebhookForm.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useWebhookLogs.js`)

### When Adding New Pages

When creating a new page/screen, **MUST** complete these required tasks:

1. **Create the page component** in `resources/js/pages/[Feature]/`
2. **Add route** in backend (`routes/web.php` or `routes/api.php`)
3. **Configure menu** in navigation structure:
   - Update `resources/js/components/nav-main.tsx` or relevant navigation file
   - Add menu item with proper icon and label
   - Ensure menu visibility reflects user permissions

4. **Setup permissions/authorization** (if applicable):
   - Define permissions in backend (e.g., `view-webhook`, `create-webhook`)
   - Add permission checks in controller before returning page
   - Hide/show menu items based on user permissions using `canViewPage()` or similar
   - Control component visibility based on permissions

✅ **CORRECT** - Complete page setup:
```tsx
// 1. Create page
// resources/js/pages/Webhook/Index.tsx
export function Index() {
  return <div>Webhook List</div>;
}

// 2. Add route in routes/web.php
Route::middleware('auth')->group(function () {
  Route::get('/webhooks', [WebhookController::class, 'index'])->name('webhooks.index');
});

// 3. Add to menu navigation
// resources/js/components/nav-main.tsx
const menuItems = [
  {
    title: 'Webhooks',
    url: '/webhooks',
    icon: HookIcon,
    isActive: currentPath.startsWith('/webhooks'),
    // Only show if user has permission
    visible: user.can('view-webhooks'),
  },
];

// 4. Setup permissions in controller
public function index()
{
    $this->authorize('view-webhooks');
    return Inertia::render('Webhook/Index', [
        'webhooks' => $this->webhookRepository->getAllActive(),
    ]);
}
```

❌ **WRONG** - Incomplete page setup:
```tsx
// Only creating the page without menu config and permissions
export function Index() {
  return <div>Webhook List</div>;
}
```

### UI Component Usage Rules

#### Priority: Use Existing UI Components
**ALWAYS prioritize using existing components from `components/ui/` before creating new ones:**

Available UI Components:
- **Layouts**: `AppShell`, `AppHeader`, `AppSidebar`, `AppContent`, `SidebarInset`
- **Forms**: `Input`, `Select`, `Checkbox`, `Toggle`, `Label`, `InputOTP`
- **Display**: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Badge`, `Skeleton`
- **Navigation**: `NavigationMenu`, `Breadcrumbs`, `NavMain`, `NavUser`
- **Feedback**: `Alert`, `AlertError`, `Dialog`, `Sheet`, `Tooltip`
- **Interactive**: `Button`, `ToggleGroup`, `Dropdown Menu`, `Collapsible`
- **Other**: `Separator`, `Avatar`, `Icon`, `Spinner`, `PlaceholderPattern`

✅ **CORRECT** - Use existing Button component:
```tsx
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return <Button variant="primary" size="default">Click me</Button>;
}
```

❌ **WRONG** - Don't create custom button styles:
```tsx
export function MyComponent() {
  return <button className="custom-button-styles">Click me</button>;
}
```

#### Responsive Design Requirements
- **MUST use Tailwind responsive classes**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **MOBILE-FIRST approach**: Default styles for mobile, add breakpoints for larger screens
- **Minimum mobile padding**: `p-4` (16px) on small screens
- **Test on all breakpoints**: Mobile (320px), Tablet (768px), Desktop (1024px+)

✅ **CORRECT** - Mobile-first responsive design:
```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-4 md:p-6 lg:p-8">
  <Card className="w-full">...</Card>
</div>
```

❌ **WRONG** - No responsive behavior:
```tsx
<div className="grid grid-cols-3 gap-8 p-8">
  <Card>...</Card>
</div>
```

#### Consistent Spacing Rules
Use Tailwind's spacing scale consistently - **NO arbitrary spacing**:

**Standard Gaps Between Components:**
- `gap-2` - Tight grouping (8px)
- `gap-4` - Normal spacing (16px) - **DEFAULT for most cases**
- `gap-6` - Generous spacing (24px) - **For sections and cards**

**Standard Padding:**
- `p-4` - Mobile default (16px)
- `p-6` - Desktop default (24px)
- `px-4 py-3` - Input/Button padding (internal consistency)

**Card/Section Structure:**
```tsx
// Main content area
<main className="mx-auto max-w-7xl flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">

// Card spacing
<Card className="gap-6">
  <CardHeader className="px-6">...</CardHeader>
  <CardContent className="px-6">...</CardContent>
</Card>

// Grid layouts
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-6">
```

#### Component Composition Pattern
Always use compound components when available:

✅ **CORRECT** - Use Card compound components:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>Content here</CardContent>
    </Card>
  );
}
```

#### Color & Styling
- Use semantic color variables: `text-primary`, `bg-card`, `border-input`
- Apply classes using `cn()` utility for combining styles
- Avoid hardcoded colors - use Tailwind theme colors

### Feature & Config Reusability

#### Global Configuration Priority
When creating features or configuration that:
- Are used in multiple files/components
- Have shared logic or state
- Are referenced across features

**MUST create in shared locations:**

1. **Utilities & Constants** → `resources/js/lib/utils.ts`
2. **Custom Hooks** → `resources/js/hooks/use-{feature}.ts`
3. **Types & Interfaces** → `resources/js/types/`
4. **Shared Components** → `resources/js/components/` (without feature subfolder)

#### Example: Creating Reusable Date Formatter
❌ **WRONG** - Repeated logic across components:
```tsx
// components/Dashboard.tsx
const formatDate = (date) => new Date(date).toLocaleDateString();

// components/Reports/Index.tsx
const formatDate = (date) => new Date(date).toLocaleDateString();
```

✅ **CORRECT** - Centralized in utils:
```tsx
// lib/utils.ts
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US');
}

// components/Dashboard.tsx
import { formatDate } from '@/lib/utils';

// components/Reports/Index.tsx
import { formatDate } from '@/lib/utils';
```

#### Example: Shared Hook for Features
✅ **CORRECT** - Feature with reusable logic in hook:
```tsx
// hooks/useWebhookLogs.ts - Reusable across all Webhook components
export function useWebhookLogs(endpointId: number) {
  const [logs, setLogs] = useState([]);
  // Shared logic here
  return { logs, loading };
}

// components/WebhookLogs.tsx
import { useWebhookLogs } from '@/hooks/useWebhookLogs';

// pages/webhook/Detail.tsx
import { useWebhookLogs } from '@/hooks/useWebhookLogs';
```

#### Example: Shared Context for Cross-Feature State
When state is used across multiple features:

✅ **CORRECT** - Context at root level:
```tsx
// Create context once
// hooks/useAppContext.ts
export const AppContext = createContext();

// Use in multiple places
import { useAppContext } from '@/hooks/useAppContext';
```

### Service Provider Pattern
Register shared utilities and hooks in service providers or initialization:

```php
// app/Providers/AppServiceProvider.php
// Register global React contexts or shared utilities here
```

## Environment

- **Backend**: Laravel 11+ with PHP 8.2+
- **Frontend**: React 18 with Vite
- **Queue**: Redis
- **Broadcasting**: Laravel Reverb/Pusher
- **Database**: MySQL 8.0+

### Docker Container Setup

This project runs inside a Docker container (FrankenPHP) at `/app/devkit`. Always execute commands within the container:

**Container Details:**
- **Container Name**: `frankenphp`
- **Working Directory**: `/app/devkit`
- **Source Host Path**: `/home/htnghia/Sources/devkit`

**Running Commands:**
```bash
# PHP/Laravel commands
docker exec -it frankenphp bash -c "cd /app/devkit && php artisan [command]"
docker exec -it frankenphp bash -c "cd /app/devkit && composer [command]"

# NPM/Node commands
docker exec -it frankenphp bash -c "cd /app/devkit && npm [command]"
docker exec -it frankenphp bash -c "cd /app/devkit && npm run dev"
docker exec -it frankenphp bash -c "cd /app/devkit && npm run build"

# Database migrations
docker exec -it frankenphp bash -c "cd /app/devkit && php artisan migrate"

# Cache clearing
docker exec -it frankenphp bash -c "cd /app/devkit && php artisan optimize:clear"
```

**DO NOT run commands directly on host machine** - always use `docker exec -it frankenphp` prefix.

**Common Docker Operations:**
```bash
# Enter container shell
docker exec -it frankenphp bash

# View logs
docker logs frankenphp -f

# Restart container
docker restart frankenphp
```

## Best Practices

1. **Follow PSR-12** coding standards
2. **Use dependency injection** over facades when possible
3. **Keep methods small** - max 20 lines
4. **Write descriptive names** - clarity over brevity
5. **Comment complex logic** but write self-documenting code
6. **Use type hints** everywhere
7. **Avoid magic numbers** - use constants
8. **Prefer composition** over inheritance
9. **Make classes final** unless designed for extension
10. **Use readonly properties** where appropriate (PHP 8.1+)

## Documentation Rules

- **DO NOT create documentation files** unless explicitly requested by user
- **DO NOT create markdown files** to summarize changes or document features
- Code should be self-documenting with clear naming and inline comments when needed
- Focus on implementation, not documentation
