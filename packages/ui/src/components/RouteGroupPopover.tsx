import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpen, Save, Trash2, Upload } from "lucide-react";
import { api } from "@/lib/api";
import type { RouterConfig } from "@/types";

interface RouteGroup {
  name: string;
  description?: string;
  Router: RouterConfig;
  forceUseImageAgent?: boolean;
}

interface RouteGroupPopoverProps {
  routerConfig: RouterConfig;
  forceUseImageAgent?: boolean;
  onLoad: (group: RouteGroup) => void;
  showToast: (message: string, type: "success" | "error" | "warning") => void;
}

export function RouteGroupPopover({
  routerConfig,
  forceUseImageAgent,
  onLoad,
  showToast,
}: RouteGroupPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<RouteGroup[]>([]);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      const data = await api.getRouteGroups();
      setGroups(data.groups || []);
    } catch {
      // Silently fail on load
    }
  };

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  const handleSave = async () => {
    if (!saveName.trim()) return;

    setLoading(true);
    try {
      await api.saveRouteGroup({
        name: saveName.trim(),
        description: saveDescription.trim() || undefined,
        Router: routerConfig,
        forceUseImageAgent,
      });
      showToast(t("router.routeGroup.saveSuccess"), "success");
      setSaveName("");
      setSaveDescription("");
      await fetchGroups();
    } catch {
      showToast(t("router.routeGroup.saveFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (group: RouteGroup) => {
    onLoad(group);
    showToast(t("router.routeGroup.loadSuccess"), "success");
    setOpen(false);
  };

  const handleDelete = async (name: string) => {
    if (!confirm(t("router.routeGroup.deleteConfirm", { name }))) return;

    try {
      await api.deleteRouteGroup(name);
      showToast(t("router.routeGroup.deleteSuccess"), "success");
      await fetchGroups();
    } catch {
      showToast(t("router.routeGroup.deleteFailed"), "error");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderOpen className="h-4 w-4 mr-1" />
          {t("router.routeGroup.title")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          {/* Save current */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("router.routeGroup.save")}</Label>
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={t("router.routeGroup.namePlaceholder")}
              className="h-8 text-sm"
            />
            <Input
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              placeholder={t("router.routeGroup.descriptionPlaceholder")}
              className="h-8 text-sm"
            />
            <Button
              onClick={handleSave}
              disabled={!saveName.trim() || loading}
              size="sm"
              className="w-full"
            >
              <Save className="h-3 w-3 mr-1" />
              {t("router.routeGroup.save")}
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Saved groups list */}
          <div className="space-y-1">
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                {t("router.routeGroup.noGroups")}
              </p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.name}
                  className="flex items-center justify-between rounded-md border px-2 py-1.5 text-sm"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="font-medium truncate">{group.name}</div>
                    {group.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {group.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => handleLoad(group)}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(group.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
