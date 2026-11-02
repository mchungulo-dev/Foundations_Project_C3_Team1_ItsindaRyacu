import { useState, type CSSProperties, type ReactNode } from "react"
import {
  RiAddLine,
  RiArrowRightLine,
  RiInboxLine,
  RiCalendarLine,
  RiHomeLine,
  RiGroupLine,
} from "@remixicon/react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Calendar } from "@/components/ui/calendar"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useTheme } from "@/components/theme-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const variants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const
const buttonSizes = ["xs", "sm", "default", "lg"] as const
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const
const sections = [
  ["foundations", "Foundations"],
  ["buttons", "Buttons"],
  ["badges", "Badges"],
  ["forms", "Forms"],
  ["cards", "Cards & dialogs"],
  ["data", "Tables"],
  ["feedback", "Feedback & layout"],
  ["navigation", "Navigation"],
  ["overlays", "Sheets & popovers"],
  ["visualization", "Avatars & charts"],
] as const
const colors = [
  ["Background", "bg-background"],
  ["Foreground", "bg-foreground"],
  ["Brand", "bg-brand"],
  ["Primary", "bg-primary"],
  ["Secondary", "bg-secondary"],
  ["Muted", "bg-muted"],
  ["Accent", "bg-accent"],
  ["Destructive", "bg-destructive"],
  ["Border", "bg-border"],
] as const

function Section({
  id,
  title,
  description,
  source,
  children,
}: {
  id: string
  title: string
  description: string
  source: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 space-y-5"
    >
      <div className="space-y-1">
        <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="font-mono text-xs break-words text-muted-foreground">
          {source}
        </p>
      </div>
      {children}
    </section>
  )
}

function Preview({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border bg-background">
      <h3 className="border-b px-5 py-3 text-sm font-medium">{title}</h3>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ButtonPlayground() {
  const [variant, setVariant] = useState<(typeof variants)[number]>("default")
  const [size, setSize] = useState<(typeof buttonSizes)[number]>("default")
  const [label, setLabel] = useState("Create project")
  const [disabled, setDisabled] = useState(false)

  return (
    <Preview title="Button playground">
      <div className="grid gap-6 md:grid-cols-2">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="button-label">Label</FieldLabel>
            <Input
              id="button-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="button-variant">Variant</FieldLabel>
              <Select
                value={variant}
                onValueChange={(value) => {
                  if (value) setVariant(value)
                }}
              >
                <SelectTrigger id="button-variant" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="button-size">Size</FieldLabel>
              <Select
                value={size}
                onValueChange={(value) => {
                  if (value) setSize(value)
                }}
              >
                <SelectTrigger id="button-size" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buttonSizes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field orientation="horizontal">
            <Checkbox
              id="button-disabled"
              checked={disabled}
              onCheckedChange={setDisabled}
            />
            <FieldLabel htmlFor="button-disabled">Disabled</FieldLabel>
          </Field>
        </FieldGroup>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex min-h-40 items-center justify-center overflow-x-auto rounded-lg border border-dashed bg-muted/30 p-6">
            <Button variant={variant} size={size} disabled={disabled}>
              {label || "Button"}
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
            <code>{`<Button variant="${variant}" size="${size}"${disabled ? " disabled" : ""}>\n  {${JSON.stringify(label || "Button")}}\n</Button>`}</code>
          </pre>
        </div>
      </div>
    </Preview>
  )
}

function CheckboxExamples() {
  const [checked, setChecked] = useState(true)
  return (
    <FieldSet>
      <FieldLegend variant="label">Checkbox states</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox id="checkbox-default" />
          <FieldLabel htmlFor="checkbox-default">Unchecked</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="checkbox-checked"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-checked">
              Receive project updates
            </FieldLabel>
            <FieldDescription>Click to try the checked state.</FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="checkbox-mixed" indeterminate />
          <FieldLabel htmlFor="checkbox-mixed">Indeterminate</FieldLabel>
        </Field>
        <Field orientation="horizontal" data-disabled>
          <Checkbox id="checkbox-disabled" disabled />
          <FieldLabel htmlFor="checkbox-disabled">Disabled</FieldLabel>
        </Field>
        <Field orientation="horizontal" data-disabled>
          <Checkbox id="checkbox-disabled-checked" defaultChecked disabled />
          <FieldLabel htmlFor="checkbox-disabled-checked">
            Disabled and checked
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

function PaginationExample() {
  const [page, setPage] = useState(1)
  const records = [
    ["Aline Nyiraneza", "Eric Mugisha"],
    ["Claudine Uwase", "Jean Habimana"],
    ["Diane Mukamana", "Patrick Niyonzima"],
  ]

  return (
    <div className="space-y-4">
      <ul className="divide-y rounded-lg border">
        {records[page - 1].map((name) => (
          <li key={name} className="px-4 py-3 text-sm">
            {name}
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Page {page} of 3 · Sample members
      </p>
      <Pagination aria-label="Sample member pages">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#navigation"
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : undefined}
              className={
                page === 1 ? "pointer-events-none opacity-50" : undefined
              }
              onClick={(event) => {
                event.preventDefault()
                setPage((current) => Math.max(1, current - 1))
              }}
            />
          </PaginationItem>
          {[1, 2, 3].map((number) => (
            <PaginationItem key={number}>
              <PaginationLink
                href="#navigation"
                isActive={page === number}
                aria-label={`Page ${number}`}
                onClick={(event) => {
                  event.preventDefault()
                  setPage(number)
                }}
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#navigation"
              aria-disabled={page === 3}
              tabIndex={page === 3 ? -1 : undefined}
              className={
                page === 3 ? "pointer-events-none opacity-50" : undefined
              }
              onClick={(event) => {
                event.preventDefault()
                setPage((current) => Math.min(3, current + 1))
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

const sidebarItems = [
  {
    title: "Overview",
    icon: RiHomeLine,
    description: "See your group's savings and recent activity.",
  },
  {
    title: "Members",
    icon: RiGroupLine,
    description: "Manage the people in your savings group.",
  },
  {
    title: "Activity",
    icon: RiInboxLine,
    description: "Review contributions and group decisions.",
  },
] as const

function SidebarExampleContent() {
  const [active, setActive] = useState<(typeof sidebarItems)[number]>(
    sidebarItems[0]
  )
  const { setOpenMobile } = useSidebar()

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <span className="truncate p-2 text-sm font-semibold group-data-[collapsible=icon]:sr-only">
            Itsinda Ryacu
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Sample workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={active.title === item.title}
                      tooltip={item.title}
                      onClick={() => {
                        setActive(item)
                        setOpenMobile(false)
                      }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="min-w-0 flex-1 space-y-4 p-4">
        <SidebarTrigger />
        <div aria-live="polite" className="space-y-2">
          <h3 className="font-semibold">{active.title}</h3>
          <p className="text-sm text-muted-foreground">{active.description}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Use the toggle to collapse the sidebar or open it on mobile.
        </p>
      </div>
    </>
  )
}

function DateExamples() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 10, 2))
  const [open, setOpen] = useState(false)
  const dateLabel = date?.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Preview title="Calendar / single date">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={date}
          className="mx-auto rounded-lg border"
        />
        <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">
          {dateLabel ? `Selected: ${dateLabel}` : "Select a meeting date."}
        </p>
      </Preview>
      <Preview title="Popover / date picker">
        <div className="space-y-3">
          <Label>Meeting date</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={<Button variant="outline" />}
              aria-label={`Choose meeting date${dateLabel ? `, ${dateLabel}` : ""}`}
            >
              <RiCalendarLine />
              {dateLabel ?? "Choose a date"}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto">
              <PopoverTitle>Meeting date</PopoverTitle>
              <PopoverDescription>
                Choose the next group meeting.
              </PopoverDescription>
              <Calendar
                mode="single"
                selected={date}
                defaultMonth={date}
                onSelect={(nextDate) => {
                  setDate(nextDate)
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
          <p className="text-sm text-muted-foreground">
            Both examples share the selected date.
          </p>
        </div>
      </Preview>
    </div>
  )
}

function ProgressExample() {
  const [value, setValue] = useState(60)
  return (
    <div className="space-y-4">
      <Progress value={value}>
        <ProgressLabel>Savings goal</ProgressLabel>
        <ProgressValue />
      </Progress>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => setValue((current) => Math.max(0, current - 20))}
          disabled={value === 0}
        >
          Decrease
        </Button>
        <Button
          onClick={() => setValue((current) => Math.min(100, current + 20))}
          disabled={value === 100}
        >
          Add contribution
        </Button>
      </div>
      <Progress value={100}>
        <ProgressLabel>Completed goal</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  )
}

const savingsData = [
  { month: "Jun", savings: 160, loans: 80 },
  { month: "Jul", savings: 210, loans: 120 },
  { month: "Aug", savings: 240, loans: 100 },
  { month: "Sep", savings: 300, loans: 160 },
  { month: "Oct", savings: 340, loans: 180 },
  { month: "Nov", savings: 400, loans: 200 },
]
const savingsConfig = {
  savings: { label: "Savings", color: "var(--chart-1)" },
  loans: { label: "Loans", color: "var(--chart-2)" },
} satisfies ChartConfig

export function DesignSystemPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-svh bg-muted/20">
      <a
        href="#main"
        className="sr-only rounded bg-background p-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <a
            href="#"
            className="flex items-center gap-3 font-semibold tracking-tight"
          >
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground"
            >
              IR
            </span>
            Itsinda Ryacu{" "}
            <span className="font-normal text-muted-foreground">
              / Design system
            </span>
          </a>
          <div className="flex items-center gap-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={theme}
              onValueChange={(value) => {
                if (value) setTheme(value)
              }}
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <nav
        aria-label="Component sections"
        className="sticky top-0 z-20 border-b bg-background"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 py-2 sm:px-8">
          {sections.map(([id, title]) => (
            <a
              key={id}
              href={`#${id}`}
              className="shrink-0 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              {title}
            </a>
          ))}
        </div>
      </nav>

      <main
        id="main"
        className="mx-auto max-w-6xl space-y-12 px-5 py-10 sm:px-8 sm:py-12"
      >
        <div className="max-w-2xl space-y-3">
          <Badge variant="outline">Component library</Badge>
          <p className="text-xs leading-relaxed text-muted-foreground">
            24 components · DM Sans · Light & dark themes
          </p>
        </div>

        <Section
          id="foundations"
          title="Foundations"
          description="Shared color tokens, typography, and corner radius. Change the theme to compare both palettes."
          source="src/index.css"
        >
          <Preview title="Color palette">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-9">
              {colors.map(([name, className]) => (
                <div key={name} className="space-y-2">
                  <div className={`h-16 rounded-lg border ${className}`} />
                  <p className="text-xs font-medium">{name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    --{name.toLowerCase()}
                  </p>
                </div>
              ))}
            </div>
          </Preview>
          <div className="grid gap-5 md:grid-cols-2">
            <Preview title="Typography / DM Sans">
              <div className="space-y-3">
                <p className="text-3xl font-semibold tracking-tight">
                  Build something together.
                </p>
                <p className="text-xl font-medium">
                  A heading for your next idea
                </p>
                <p className="text-sm">
                  Body text for clear, everyday communication.
                </p>
                <p className="text-xs text-muted-foreground">
                  Small text for supporting details.
                </p>
              </div>
            </Preview>
            <Preview title="Corner radius">
              <div className="flex flex-wrap gap-5">
                {[
                  ["sm", "rounded-sm"],
                  ["md", "rounded-md"],
                  ["lg", "rounded-lg"],
                  ["xl", "rounded-xl"],
                ].map(([name, className]) => (
                  <div key={name} className="space-y-2 text-center">
                    <div
                      className={`size-14 border border-primary/30 bg-primary/10 ${className}`}
                    />
                    <p className="font-mono text-xs text-muted-foreground">
                      {name}
                    </p>
                  </div>
                ))}
              </div>
            </Preview>
          </div>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          description="Every variant and size, plus a live playground for trying combinations. Hover or tab through examples to inspect interaction states."
          source="src/components/ui/button.tsx"
        >
          <Preview title="Variants / enabled & disabled">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
              {variants.map((variant) => (
                <div key={variant} className="flex flex-col items-start gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {variant}
                  </span>
                  <Button variant={variant}>Button</Button>
                  <Button variant={variant} disabled>
                    Disabled
                  </Button>
                </div>
              ))}
            </div>
          </Preview>
          <Preview title="Sizes & icons">
            <div className="flex flex-wrap items-end gap-6">
              {buttonSizes.map((size) => (
                <div key={size} className="space-y-2">
                  <p className="font-mono text-xs text-muted-foreground">
                    {size}
                  </p>
                  <Button size={size}>Button</Button>
                </div>
              ))}
              {iconSizes.map((size) => (
                <div key={size} className="space-y-2">
                  <p className="font-mono text-xs text-muted-foreground">
                    {size}
                  </p>
                  <Button
                    size={size}
                    variant="outline"
                    aria-label={`Add (${size})`}
                  >
                    <RiAddLine />
                  </Button>
                </div>
              ))}
              <Button>
                <RiAddLine data-icon="inline-start" />
                Create project
              </Button>
              <Button variant="outline">
                Continue
                <RiArrowRightLine data-icon="inline-end" />
              </Button>
            </div>
          </Preview>
          <ButtonPlayground />
        </Section>

        <Section
          id="badges"
          title="Badges"
          description="Compact labels for status, categories, and metadata."
          source="src/components/ui/badge.tsx"
        >
          <Preview title="All variants">
            <div className="flex flex-wrap gap-4">
              {variants.map((variant) => (
                <Badge key={variant} variant={variant}>
                  {variant}
                </Badge>
              ))}
            </div>
          </Preview>
        </Section>

        <Section
          id="forms"
          title="Forms & controls"
          description="Inputs, textareas, selects, checkboxes, labels, and composed fields. These examples are interactive and use sample data."
          source="src/components/ui/{input,textarea,select,checkbox,label,field}.tsx"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Preview title="Input & field states">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" placeholder="Your name" />
                  <FieldDescription>
                    Default input with helper text.
                  </FieldDescription>
                </Field>
                <Field data-invalid>
                  <FieldLabel htmlFor="email">Email / invalid</FieldLabel>
                  <Input
                    id="email"
                    defaultValue="hello@"
                    aria-invalid
                    aria-describedby="email-error"
                  />
                  <FieldError id="email-error">
                    Enter a valid email address.
                  </FieldError>
                </Field>
                <Field data-disabled>
                  <FieldLabel htmlFor="disabled-input">Disabled</FieldLabel>
                  <Input
                    id="disabled-input"
                    placeholder="Unavailable"
                    disabled
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="readonly-input">Read only</FieldLabel>
                  <Input id="readonly-input" value="Itsinda Ryacu" readOnly />
                </Field>
              </FieldGroup>
            </Preview>
            <Preview title="Textarea states">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your project…"
                  />
                </Field>
                <Field data-invalid>
                  <FieldLabel htmlFor="invalid-textarea">Invalid</FieldLabel>
                  <Textarea
                    id="invalid-textarea"
                    aria-invalid
                    aria-describedby="description-error"
                    defaultValue="Too short"
                  />
                  <FieldError id="description-error">
                    Add a little more detail.
                  </FieldError>
                </Field>
                <Field data-disabled>
                  <FieldLabel htmlFor="disabled-textarea">Disabled</FieldLabel>
                  <Textarea
                    id="disabled-textarea"
                    disabled
                    placeholder="Unavailable"
                  />
                </Field>
              </FieldGroup>
            </Preview>
            <Preview title="Select states">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="project-select">Project</FieldLabel>
                  <Select
                    items={{
                      foundations: "Foundations project",
                      community: "Community project",
                      archived: "Archived project",
                    }}
                  >
                    <SelectTrigger id="project-select" className="w-full">
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Active projects</SelectLabel>
                        <SelectItem value="foundations">
                          Foundations project
                        </SelectItem>
                        <SelectItem value="community">
                          Community project
                        </SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectItem value="archived" disabled>
                        Archived project
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="small-select">Small</FieldLabel>
                  <Select defaultValue="member">
                    <SelectTrigger
                      id="small-select"
                      size="sm"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field data-invalid>
                  <FieldLabel htmlFor="invalid-select">Invalid</FieldLabel>
                  <Select>
                    <SelectTrigger
                      id="invalid-select"
                      aria-invalid
                      aria-describedby="select-error"
                      className="w-full"
                    >
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError id="select-error">
                    Choose a role to continue.
                  </FieldError>
                </Field>
                <Field data-disabled>
                  <FieldLabel htmlFor="disabled-select">Disabled</FieldLabel>
                  <Select disabled>
                    <SelectTrigger id="disabled-select" className="w-full">
                      <SelectValue placeholder="Unavailable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </Preview>
            <Preview title="Checkbox & field composition">
              <CheckboxExamples />
            </Preview>
          </div>
        </Section>

        <Section
          id="cards"
          title="Cards & dialogs"
          description="Containers for related content and a working modal with focus management and keyboard dismissal."
          source="src/components/ui/{card,dialog}.tsx"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {(["default", "sm"] as const).map((size) => (
              <Card key={size} size={size}>
                <CardHeader>
                  <CardTitle>Foundations project</CardTitle>
                  <CardDescription>Card size: {size}</CardDescription>
                  <CardAction>
                    <Badge variant="secondary">Draft</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  A shared space for our team to build, learn, and collaborate.
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button
                          variant="outline"
                          size={size === "sm" ? "sm" : "default"}
                        />
                      }
                    >
                      Preview dialog
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Project details</DialogTitle>
                        <DialogDescription>
                          This is a preview of our dialog component. Try Escape,
                          the close icon, or the button below.
                        </DialogDescription>
                      </DialogHeader>
                      <p className="text-sm">
                        Card size: {size}. Dialogs keep related content in
                        focus.
                      </p>
                      <DialogFooter>
                        <DialogClose render={<Button />}>Done</DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          id="data"
          title="Tables"
          description="Tabular content with status badges, row hover, a selected row, caption, and footer."
          source="src/components/ui/table.tsx"
        >
          <Preview title="Project overview / sample data">
            <Table>
              <TableCaption>
                Example project data for previewing table styles.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Project</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col" className="text-right">
                    Members
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(
                  [
                    {
                      name: "Foundations project",
                      status: "Active",
                      variant: "default",
                      members: 6,
                    },
                    {
                      name: "Community research",
                      status: "Draft",
                      variant: "secondary",
                      members: 4,
                    },
                    {
                      name: "Team retrospective",
                      status: "Archived",
                      variant: "outline",
                      members: 6,
                    },
                  ] as const
                ).map((project, index) => (
                  <TableRow
                    key={project.name}
                    data-state={index === 1 ? "selected" : undefined}
                  >
                    <TableCell className="font-medium">
                      {project.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={project.variant}>{project.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {project.members}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Total projects</TableCell>
                  <TableCell className="text-right">3</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Preview>
        </Section>

        <Section
          id="feedback"
          title="Feedback & layout"
          description="Empty states, loading placeholders, and separators for organizing content."
          source="src/components/ui/{empty,skeleton,separator,field}.tsx"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Preview title="Empty / icon & default media">
              <div className="space-y-4">
                {(["icon", "default"] as const).map((variant) => (
                  <Empty key={variant} className="border">
                    <EmptyHeader>
                      <EmptyMedia variant={variant}>
                        <RiInboxLine className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle>No projects yet</EmptyTitle>
                      <EmptyDescription>
                        New projects will appear here. Media variant: {variant}.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <p className="text-xs text-muted-foreground">
                        Create a project from your workspace to get started.
                      </p>
                    </EmptyContent>
                  </Empty>
                ))}
              </div>
            </Preview>
            <div className="space-y-5">
              <Preview title="Skeleton / loading content">
                <div role="status" className="flex gap-4">
                  <span className="sr-only">Loading example content</span>
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div aria-hidden="true" className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </Preview>
              <Preview title="Separator / horizontal, vertical & labeled">
                <div className="space-y-5 text-sm">
                  <p>Horizontal separator</p>
                  <Separator />
                  <div className="flex h-5 items-center gap-4">
                    <span>Overview</span>
                    <Separator orientation="vertical" />
                    <span>Details</span>
                    <Separator orientation="vertical" />
                    <span>Activity</span>
                  </div>
                  <FieldGroup>
                    <FieldSeparator>or continue with</FieldSeparator>
                  </FieldGroup>
                </div>
              </Preview>
            </div>
          </div>
        </Section>

        <Section
          id="navigation"
          title="Navigation"
          description="Breadcrumbs, interactive pagination, and a responsive sidebar with active and collapsed states."
          source="src/components/ui/{breadcrumb,pagination,sidebar}.tsx"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Preview title="Breadcrumb / current page">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#main">Design system</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#navigation">
                      Navigation
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Preview>
            <Preview title="Pagination / sample member list">
              <PaginationExample />
            </Preview>
          </div>
          <Preview title="Sidebar / desktop collapse & mobile sheet">
            <TooltipProvider>
              <SidebarProvider
                className="relative isolate min-h-72 overflow-hidden rounded-lg border [&_[data-slot=sidebar-container]]:absolute [&_[data-slot=sidebar-container]]:h-full"
                style={{ "--sidebar-width": "13rem" } as CSSProperties}
              >
                <SidebarExampleContent />
              </SidebarProvider>
            </TooltipProvider>
          </Preview>
        </Section>

        <Section
          id="overlays"
          title="Sheets, popovers & tooltips"
          description="Side panels from every edge, date selection, and contextual help. Open overlays and use Escape to dismiss them."
          source="src/components/ui/{sheet,popover,calendar,tooltip}.tsx"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Preview title="Sheet / all sides">
              <div className="flex flex-wrap gap-3">
                {(["left", "right", "top", "bottom"] as const).map((side) => (
                  <Sheet key={side}>
                    <SheetTrigger render={<Button variant="outline" />}>
                      Open {side}
                    </SheetTrigger>
                    <SheetContent side={side}>
                      <SheetHeader>
                        <SheetTitle>Group details</SheetTitle>
                        <SheetDescription>
                          Sample panel opening from the {side}.
                        </SheetDescription>
                      </SheetHeader>
                      <p className="px-4 text-sm">
                        Twitezimbere · 24 members · Kigali
                      </p>
                      <SheetFooter>
                        <SheetClose render={<Button />}>Done</SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                ))}
              </div>
            </Preview>
            <Preview title="Tooltip / hover or keyboard focus">
              <TooltipProvider>
                <div className="flex flex-wrap gap-3">
                  {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <Tooltip key={side}>
                      <TooltipTrigger render={<Button variant="outline" />}>
                        Help {side}
                      </TooltipTrigger>
                      <TooltipContent side={side}>
                        Your group records stay connected to your account.
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </Preview>
          </div>
          <DateExamples />
        </Section>

        <Section
          id="visualization"
          title="Avatars, progress & charts"
          description="Member identities, savings targets, and an interactive chart using the shared palette. All values are sample data."
          source="src/components/ui/{avatar,progress,chart}.tsx"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Preview title="Avatar / sizes, fallback & group">
              <div className="space-y-5">
                <div className="flex items-end gap-5">
                  {(["sm", "default", "lg"] as const).map((size) => (
                    <div key={size} className="space-y-2">
                      <Avatar size={size} aria-label="Aline Nyiraneza">
                        <AvatarFallback>AN</AvatarFallback>
                        <AvatarBadge aria-label="Online" />
                      </Avatar>
                      <p className="font-mono text-xs text-muted-foreground">
                        {size}
                      </p>
                    </div>
                  ))}
                </div>
                <AvatarGroup aria-label="Sample group members">
                  {["AN", "EM", "CU"].map((initials) => (
                    <Avatar key={initials} aria-label={`Member ${initials}`}>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  ))}
                  <AvatarGroupCount aria-label="21 more members">
                    +21
                  </AvatarGroupCount>
                </AvatarGroup>
              </div>
            </Preview>
            <Preview title="Progress / adjustable & complete">
              <ProgressExample />
            </Preview>
          </div>
          <Preview title="Chart / monthly savings & loans">
            <p className="mb-4 text-sm text-muted-foreground">
              Sample amounts in thousands of Rwandan francs. Hover or use the
              arrow keys to inspect values.
            </p>
            <ChartContainer config={savingsConfig} className="h-64 w-full">
              <BarChart accessibilityLayer data={savingsData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="savings" fill="var(--color-savings)" radius={4} />
                <Bar dataKey="loans" fill="var(--color-loans)" radius={4} />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 flex justify-center gap-5 text-sm">
              {Object.entries(savingsConfig).map(([key, item]) => (
                <span key={key} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
              ))}
            </div>
          </Preview>
        </Section>
      </main>
    </div>
  )
}
