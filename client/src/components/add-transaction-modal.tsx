import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiService } from "@/lib/apiService";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Amount is required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any;
}

export default function AddTransactionModal({ isOpen, onClose, transaction }: AddTransactionModalProps) {
  const { toast } = useToast();
  const { getCurrencySymbol } = useCurrency();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<"income" | "expense">("expense");

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      description: "",
      categoryId: undefined,
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch categories based on selected type
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories", { type: selectedType }],
    queryFn: async () => {
      const response = await apiService.getCategories(selectedType);
      return response.data;
    },
    retry: false,
  });

  // Create/Update transaction mutation
  const transactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      if (transaction) {
        return await apiService.updateTransaction(transaction._id, data);
      } else {
        return await apiService.createTransaction(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/recent-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/category-expenses"] });
      
      toast({
        title: "Success",
        description: `Transaction ${transaction ? "updated" : "created"} successfully`,
      });
      
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${transaction ? "update" : "create"} transaction`,
        variant: "destructive",
      });
    },
  });

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setSelectedType(transaction.type);
      form.reset({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        categoryId: transaction.categoryId,
        date: new Date(transaction.date).toISOString().split("T")[0],
      });
    } else {
      form.reset({
        type: "expense",
        amount: "",
        description: "",
        categoryId: undefined,
        date: new Date().toISOString().split("T")[0],
      });
      setSelectedType("expense");
    }
  }, [transaction, form]);

  // Watch type changes
  const watchedType = form.watch("type");
  useEffect(() => {
    if (watchedType !== selectedType) {
      setSelectedType(watchedType);
      form.setValue("categoryId", undefined); // Reset category when type changes
    }
  }, [watchedType, selectedType, form]);

  const onSubmit = (data: TransactionFormData) => {
    transactionMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit Transaction" : "Add New Transaction"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={field.value === "expense" ? "default" : "outline"}
                      className={`p-3 ${
                        field.value === "expense" 
                          ? "bg-primary text-white" 
                          : "border-gray-300 text-gray-700 hover:border-primary"
                      }`}
                      onClick={() => field.onChange("expense")}
                    >
                      <i className="fas fa-minus mr-2"></i>Expense
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "income" ? "default" : "outline"}
                      className={`p-3 ${
                        field.value === "income" 
                          ? "bg-secondary text-white" 
                          : "border-gray-300 text-gray-700 hover:border-secondary"
                      }`}
                      onClick={() => field.onChange("income")}
                    >
                      <i className="fas fa-plus mr-2"></i>Income
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">{getCurrencySymbol()}</span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <div className="p-2 text-sm text-gray-500">Loading categories...</div>
                      ) : categories?.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No categories available</div>
                      ) : (
                        categories?.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={transactionMutation.isPending}
              >
                {transactionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {transaction ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  transaction ? "Update Transaction" : "Add Transaction"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
