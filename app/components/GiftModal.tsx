import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Gift, DollarSign, MessageSquare, User } from "lucide-react";

interface GiftModalProps {
  gift: {
    _id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    media?: string;
    type?: string;
  };
  creator: {
    name: string;
    handle: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (data: {
    giftId: string;
    quantity: number;
    fanName: string;
    message: string;
  }) => void;
}

export function GiftModal({ gift, creator, isOpen, onClose, onPurchase }: GiftModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [fanName, setFanName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  const totalPrice = gift.price * quantity;

  const handleSubmit = async () => {
    if (!fanName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onPurchase({
        giftId: gift._id,
        quantity,
        fanName: fanName.trim(),
        message: message.trim(),
      });
      onClose();
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setQuantity(1);
      setFanName("");
      setMessage("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-400" />
            Buy Gift for {creator.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Gift Info */}
          <div className="bg-[#232323] p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">{gift.title}</h3>
            <p className="text-slate-400 text-sm mb-3">{gift.description}</p>
            
            {gift.media && gift.type === 'image' && (
              <img 
                src={gift.media} 
                alt={gift.title}
                className="w-full h-24 object-cover rounded mb-3"
              />
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Price per gift:</span>
              <span className="text-emerald-400 font-semibold">
                {formatPrice(gift.price, gift.currency)}
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-white">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isSubmitting}
                className="border-[#333] text-white hover:bg-[#333]"
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="bg-[#2a2a2a] border-[#333] text-white text-center"
                disabled={isSubmitting}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                disabled={isSubmitting}
                className="border-[#333] text-white hover:bg-[#333]"
              >
                +
              </Button>
            </div>
          </div>

          {/* Fan Name */}
          <div className="space-y-2">
            <Label htmlFor="fanName" className="text-white flex items-center gap-2">
              <User className="w-4 h-4" />
              Your Name
            </Label>
            <Input
              id="fanName"
              value={fanName}
              onChange={(e) => setFanName(e.target.value)}
              placeholder="Enter your name"
              className="bg-[#2a2a2a] border-[#333] text-white"
              disabled={isSubmitting}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="bg-[#2a2a2a] border-[#333] text-white"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Total */}
          <div className="bg-[#232323] p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Total:</span>
              <span className="text-emerald-400 font-bold text-lg">
                {formatPrice(totalPrice, gift.currency)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-[#333] text-white hover:bg-[#333]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!fanName.trim() || isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? "Processing..." : "Buy Gift"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}