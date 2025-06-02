
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import LaundryOrderForm from './LaundryOrderForm';

const LaundryOrderModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Pesanan Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Pesanan Baru</DialogTitle>
          <DialogDescription>
            Tambahkan pesanan laundry baru
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <LaundryOrderForm onOrderCreated={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LaundryOrderModal;
