import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Clock, AlertTriangle, FileWarning, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-provider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface NotificationPrefs {
  email_enabled: boolean;
  critical_incidents: boolean;
  overdue_actions: boolean;
  compliance_reviews: boolean;
  high_risks: boolean;
  due_soon_days: number;
}

const DEFAULT_PREFS: NotificationPrefs = {
  email_enabled: false,
  critical_incidents: true,
  overdue_actions: true,
  compliance_reviews: true,
  high_risks: true,
  due_soon_days: 3,
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          email_enabled: data.email_enabled,
          critical_incidents: data.critical_incidents,
          overdue_actions: data.overdue_actions,
          compliance_reviews: data.compliance_reviews,
          high_risks: data.high_risks,
          due_soon_days: data.due_soon_days,
        });
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        ...prefs,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Notification preferences saved");
    }
    setSaving(false);
  };

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const alertTypes = [
    {
      key: "critical_incidents" as const,
      label: "Critical Incidents",
      description: "Alert when incidents with critical or high severity are open",
      icon: FileWarning,
      color: "text-severity-critical",
    },
    {
      key: "overdue_actions" as const,
      label: "Overdue Actions",
      description: "Alert when action items pass their due date",
      icon: Clock,
      color: "text-severity-high",
    },
    {
      key: "compliance_reviews" as const,
      label: "Compliance Reviews Due",
      description: "Alert when compliance items haven't been reviewed in 90+ days",
      icon: Shield,
      color: "text-severity-medium",
    },
    {
      key: "high_risks" as const,
      label: "High Risks",
      description: "Alert when risk score (probability × impact) reaches critical levels",
      icon: AlertTriangle,
      color: "text-severity-high",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Notification Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure which alerts you want to receive and how
        </p>
      </div>

      {/* Email toggle */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Email Notifications</CardTitle>
              <CardDescription>Receive email alerts for critical GRC events</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-toggle" className="text-sm font-medium">
              Enable email notifications
            </Label>
            <Switch
              id="email-toggle"
              checked={prefs.email_enabled}
              onCheckedChange={() => togglePref("email_enabled")}
            />
          </div>
          {prefs.email_enabled && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs text-muted-foreground mt-2 p-2 rounded bg-accent/30"
            >
              📧 Email delivery is not yet configured. Alerts will appear in-app. Connect an email provider later to enable delivery.
            </motion.p>
          )}
        </CardContent>
      </Card>

      {/* Alert types */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alert Types</CardTitle>
          <CardDescription>Choose which types of alerts to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alertTypes.map((item, idx) => (
            <div key={item.key}>
              {idx > 0 && <Separator className="mb-4" />}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <item.icon className={`w-5 h-5 mt-0.5 ${item.color}`} />
                  <div>
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={prefs[item.key] as boolean}
                  onCheckedChange={() => togglePref(item.key)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Due soon threshold */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Advance Warning</CardTitle>
          <CardDescription>How many days before a due date should you be alerted?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Label htmlFor="due-days" className="text-sm whitespace-nowrap">
              Alert me
            </Label>
            <Input
              id="due-days"
              type="number"
              min={1}
              max={30}
              value={prefs.due_soon_days}
              onChange={(e) => setPrefs((p) => ({ ...p, due_soon_days: Math.max(1, Math.min(30, Number(e.target.value) || 3)) }))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">days before due date</span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Save Preferences
      </Button>
    </div>
  );
}
