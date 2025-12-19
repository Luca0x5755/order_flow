import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Minus, Trash2, ShoppingCart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { products, type Product } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const orderSchema = z.object({
  shippingAddress: z.string().min(5, "請輸入完整的配送地址"),
  phone: z.string().regex(/^0\d{2,3}-?\d{3}-?\d{3,4}$/, "請輸入有效的電話號碼"),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface CartItem {
  product: Product;
  quantity: number;
}

export default function NewOrder() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      shippingAddress: "",
      phone: "",
      notes: "",
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const addToCart = () => {
    if (!selectedProductId) return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setSelectedProductId("");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const onSubmit = async (data: OrderFormData) => {
    if (cart.length === 0) {
      toast({
        title: "請選擇商品",
        description: "購物車是空的，請先添加商品",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "訂單已建立！",
      description: `訂單金額：${formatCurrency(totalAmount)}`,
    });

    navigate("/orders");
  };

  return (
    <div className="container py-8 max-w-3xl">
      {/* Page Header */}
      <div className="space-y-2 mb-8 opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">新增訂單</h1>
        <p className="text-muted-foreground">
          選擇商品並填寫配送資訊以建立新訂單
        </p>
      </div>

      <div className="space-y-8">
        {/* Product Selection */}
        <div 
          className="space-y-4 opacity-0 animate-fade-in" 
          style={{ animationDelay: "100ms" }}
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            選擇商品
          </h2>

          <div className="flex gap-3">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="選擇商品..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex justify-between items-center w-full gap-4">
                      <span>{product.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addToCart} disabled={!selectedProductId}>
              <Plus className="h-4 w-4 mr-1" />
              加入
            </Button>
          </div>

          {/* Cart Items */}
          {cart.length > 0 && (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="divide-y">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-4 gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.product.price)} / 件
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="font-semibold">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="bg-muted/50 px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  共 {totalQuantity} 件商品
                </span>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">總計</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {cart.length === 0 && (
            <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">購物車是空的</p>
              <p className="text-sm text-muted-foreground">請選擇商品加入購物車</p>
            </div>
          )}
        </div>

        {/* Shipping Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div 
              className="space-y-4 opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <h2 className="text-lg font-semibold">配送資訊</h2>

              <FormField
                control={form.control}
                name="shippingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配送地址</FormLabel>
                    <FormControl>
                      <Input placeholder="請輸入完整配送地址" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>聯絡電話</FormLabel>
                    <FormControl>
                      <Input placeholder="例：0912-345-678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      備註 <span className="text-muted-foreground font-normal">（選填）</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="特殊配送需求或其他備註..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div 
              className="pt-4 opacity-0 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg h-14 gap-2"
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-pulse-soft">處理中...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    送出訂單
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
