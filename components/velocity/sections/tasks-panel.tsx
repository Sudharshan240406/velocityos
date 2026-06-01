"use client";

import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { CheckCircle2, GripVertical, Trash2 } from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/velocity/ui";
import type { Task } from "@/lib/types";

export function TasksPanel({
  input,
  tasks,
  onChangeInput,
  onDeleteTask,
  onDragEnd,
  onSubmitTask,
  onToggleTask,
}: {
  input: string;
  tasks: Task[];
  onChangeInput: (value: string) => void;
  onDeleteTask: (id: string) => void;
  onDragEnd: (tasks: Task[]) => void;
  onSubmitTask: () => void;
  onToggleTask: (id: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);
    onDragEnd(arrayMove(tasks, oldIndex, newIndex));
  }

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <SectionHeader eyebrow="Mission control" title="Priority stack" copy="Queue, reorder, and complete the work that keeps your engine moving." />
        <div className="flex w-full max-w-xl gap-3">
          <label htmlFor="new-mission-input" className="sr-only">
            New mission title
          </label>
          <input
            id="new-mission-input"
            value={input}
            onChange={(event) => onChangeInput(event.target.value)}
            placeholder="Add a new mission..."
            className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30"
          />
          <button type="button" onClick={onSubmitTask} className="rounded-[24px] bg-white px-5 py-3 font-medium text-slate-950">
            Add
          </button>
        </div>
      </div>

      <div className="mt-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onToggle={onToggleTask} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </GlassCard>
  );
}

// ... helper function remains the same ...
function TaskCard({
  task,
  onDelete,
  onToggle,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-[26px] border border-white/10 bg-black/20 p-4"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className="text-white/60 hover:text-emerald-300"
          aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
        >
          <CheckCircle2 className={clsx("h-5 w-5", task.completed ? "text-emerald-400" : "text-white/35")} />
        </button>
        <div className="flex-1">
          <p className={clsx("text-white", task.completed && "text-white/35 line-through")}>{task.title}</p>
          <p className="mt-1 text-sm text-white/35">
            {task.minutes} min | {task.energy} energy
          </p>
        </div>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-white/35 hover:text-white"
          aria-label="Drag to reorder task"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="text-white/35 hover:text-white"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
