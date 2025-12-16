import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogHours } from "@/hooks/useHours";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const hoursSchema = z.object({
    hours: z.coerce.number().min(0.5, "Minimum 0.5 hours").max(24, "Maximum 24 hours per day"),
    description: z.string().min(10, "Please provide a detailed description (min 10 characters)"),
    date_worked: z.date({ required_error: "Please select a date" }),
});

type HoursFormData = z.infer<typeof hoursSchema>;

interface HoursLogModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    projectTitle: string;
}

const HoursLogModal = ({ open, onOpenChange, projectId, projectTitle }: HoursLogModalProps) => {
    const { toast } = useToast();
    const logHours = useLogHours();
    const [calendarOpen, setCalendarOpen] = useState(false);

    const form = useForm<HoursFormData>({
        resolver: zodResolver(hoursSchema),
        defaultValues: {
            hours: 1,
            description: "",
        },
    });

    const onSubmit = async (data: HoursFormData) => {
        try {
            await logHours.mutateAsync({
                project_id: projectId,
                hours: data.hours,
                description: data.description,
                date_worked: data.date_worked.toISOString(),
            });

            toast({
                title: "Hours Logged",
                description: "Your hours have been submitted for verification.",
            });

            form.reset();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to log hours",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log Volunteer Hours</DialogTitle>
                    <DialogDescription>
                        Log your volunteer hours for <strong>{projectTitle}</strong>.
                        Hours will be reviewed by a mobilizer before being verified.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date_worked"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of Service</FormLabel>
                                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    field.onChange(date);
                                                    setCalendarOpen(false);
                                                }}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("2020-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hours Worked</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            min="0.5"
                                            max="24"
                                            placeholder="Enter hours"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description of Work</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the volunteer work you performed..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={logHours.isPending}>
                                {logHours.isPending ? "Submitting..." : "Submit Hours"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default HoursLogModal;
