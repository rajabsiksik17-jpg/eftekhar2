import { createServiceClient } from "@/lib/supabase/client";
import { decrypt } from "@/lib/encryption";

export interface ImapConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: "NONE" | "TLS" | "SSL";
}

export async function getImapConfig(): Promise<ImapConfig | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("email_settings").select("*").eq("id", 1).single();
  if (!data?.imap_host || !data?.imap_username) return null;
  return {
    host: data.imap_host,
    port: data.imap_port ?? 993,
    username: data.imap_username,
    password: decrypt(data.imap_password_enc),
    encryption: (data.imap_encryption as ImapConfig["encryption"]) ?? "SSL",
  };
}

export async function testImap(config: ImapConfig): Promise<{ ok: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Imap = require("imap") as typeof import("imap");
  return new Promise((resolve) => {
    let settled = false;
    const imap = new Imap({
      user: config.username,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.encryption === "SSL",
      tlsOptions: config.encryption === "TLS" ? { servername: config.host } : undefined,
      connTimeout: 15000,
      authTimeout: 15000,
    });
    const finish = (ok: boolean, error?: string) => {
      if (settled) return;
      settled = true;
      try {
        imap.end();
      } catch {
        /* noop */
      }
      resolve({ ok, error });
    };
    imap.once("ready", () => finish(true));
    imap.once("error", (err: Error) => finish(false, err.message));
    imap.connect();
    setTimeout(() => finish(false, "Connection timed out."), 16000);
  });
}
