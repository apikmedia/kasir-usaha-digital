
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bluetooth, Printer, Save, TestTube } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface PrinterConfig {
  isBluetoothEnabled: boolean;
  deviceName: string;
  paperWidth: '58mm' | '80mm';
  receiptHeader: string;
  receiptFooter: string;
  showLogo: boolean;
  fontSize: 'small' | 'medium' | 'large';
  autoPrint: boolean;
}

const PrinterSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<PrinterConfig>({
    isBluetoothEnabled: false,
    deviceName: '',
    paperWidth: '58mm',
    receiptHeader: 'TOKO SAYA\nJl. Contoh No. 123\nTelp: 081234567890',
    receiptFooter: 'Terima kasih atas kunjungan Anda!\nSampai jumpa lagi!',
    showLogo: true,
    fontSize: 'medium',
    autoPrint: false
  });

  const [bluetoothDevices, setBluetoothDevices] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('printerConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('printerConfig', JSON.stringify(config));
    toast({
      title: "Berhasil",
      description: "Pengaturan printer berhasil disimpan",
    });
  };

  const scanBluetoothDevices = async () => {
    setIsScanning(true);
    try {
      if ('bluetooth' in navigator) {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service']
        });
        setConfig(prev => ({ ...prev, deviceName: device.name || 'Unknown Device' }));
        toast({
          title: "Berhasil",
          description: `Perangkat ${device.name} berhasil dipilih`,
        });
      } else {
        toast({
          title: "Error",
          description: "Browser tidak mendukung Bluetooth",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Bluetooth scan error:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan scan Bluetooth",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const testPrint = () => {
    const testReceipt = `${config.receiptHeader}\n================================\nTEST PRINT\nTanggal: ${new Date().toLocaleString('id-ID')}\n================================\n${config.receiptFooter}`;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Test Print</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: ${config.fontSize === 'small' ? '10px' : config.fontSize === 'large' ? '14px' : '12px'}; 
                line-height: 1.4; 
                margin: 0; 
                padding: 20px;
                white-space: pre-wrap;
                width: ${config.paperWidth === '58mm' ? '200px' : '280px'};
              }
            </style>
          </head>
          <body>${testReceipt}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Test Print",
      description: "Test print berhasil dikirim",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bluetooth className="h-5 w-5" />
            <span>Pengaturan Printer Bluetooth</span>
          </CardTitle>
          <CardDescription>
            Konfigurasi printer Bluetooth untuk mencetak nota
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.isBluetoothEnabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isBluetoothEnabled: checked }))}
            />
            <Label>Aktifkan Printer Bluetooth</Label>
          </div>

          {config.isBluetoothEnabled && (
            <>
              <div className="space-y-2">
                <Label>Nama Perangkat</Label>
                <div className="flex space-x-2">
                  <Input
                    value={config.deviceName}
                    onChange={(e) => setConfig(prev => ({ ...prev, deviceName: e.target.value }))}
                    placeholder="Pilih atau masukkan nama printer"
                  />
                  <Button
                    onClick={scanBluetoothDevices}
                    disabled={isScanning}
                    variant="outline"
                  >
                    <Bluetooth className="h-4 w-4" />
                    {isScanning ? 'Scanning...' : 'Scan'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lebar Kertas</Label>
                <Select value={config.paperWidth} onValueChange={(value: '58mm' | '80mm') => setConfig(prev => ({ ...prev, paperWidth: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="58mm">58mm (Thermal Mini)</SelectItem>
                    <SelectItem value="80mm">80mm (Thermal Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ukuran Font</Label>
                <Select value={config.fontSize} onValueChange={(value: 'small' | 'medium' | 'large') => setConfig(prev => ({ ...prev, fontSize: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="small">Kecil</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="large">Besar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.autoPrint}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoPrint: checked }))}
                />
                <Label>Auto Print setelah checkout</Label>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Format Nota</CardTitle>
          <CardDescription>
            Kustomisasi tampilan nota yang akan dicetak
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Header Nota</Label>
            <Textarea
              value={config.receiptHeader}
              onChange={(e) => setConfig(prev => ({ ...prev, receiptHeader: e.target.value }))}
              placeholder="Nama toko, alamat, telepon..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Footer Nota</Label>
            <Textarea
              value={config.receiptFooter}
              onChange={(e) => setConfig(prev => ({ ...prev, receiptFooter: e.target.value }))}
              placeholder="Pesan terima kasih..."
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.showLogo}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showLogo: checked }))}
            />
            <Label>Tampilkan Logo (jika ada)</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-2">
        <Button onClick={saveConfig} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Simpan Pengaturan</span>
        </Button>
        
        <Button onClick={testPrint} variant="outline" className="flex items-center space-x-2">
          <TestTube className="h-4 w-4" />
          <span>Test Print</span>
        </Button>
      </div>
    </div>
  );
};

export default PrinterSettings;
