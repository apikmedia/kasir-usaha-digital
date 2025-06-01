
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Printer, User, Shield } from "lucide-react";
import PrinterSettings from './PrinterSettings';

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8 text-gray-600" />
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
      </div>

      <Tabs defaultValue="printer" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="printer" className="flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span>Printer</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Keamanan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="printer">
          <PrinterSettings />
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Profil</CardTitle>
              <CardDescription>
                Kelola informasi profil dan bisnis Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Fitur pengaturan profil akan segera tersedia...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Keamanan</CardTitle>
              <CardDescription>
                Kelola password dan keamanan akun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Fitur pengaturan keamanan akan segera tersedia...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
