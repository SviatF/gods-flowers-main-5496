import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  applySiteContent,
  getSiteContentSnapshot,
  type SiteContent,
} from "../content/site-runtime";

type SiteContentContextValue = {
  revision: number;
  content: SiteContent;
  applyPreview: (content: SiteContent) => void;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [revision, setRevision] = useState(0);
  const [content, setContent] = useState<SiteContent>(() => getSiteContentSnapshot());

  const apply = (next: SiteContent) => {
    applySiteContent(next);
    setContent(structuredClone(next));
    setRevision((value) => value + 1);
  };

  useEffect(() => {
    let active = true;

    fetch("/api/site-content", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as SiteContent;
      })
      .then((next) => {
        if (active && next) apply(next);
      })
      .catch(() => {
        // Static/Vercel preview can run without the file-backed API.
      });

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "gods-flowers:preview") return;
      apply(event.data.content as SiteContent);
    };

    window.addEventListener("message", onMessage);
    return () => {
      active = false;
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const value = useMemo(
    () => ({ revision, content, applyPreview: apply }),
    [revision, content],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const value = useContext(SiteContentContext);
  if (!value) throw new Error("useSiteContent must be used inside SiteContentProvider");
  return value;
}

export function useSiteContentRevision() {
  return useSiteContent().revision;
}
