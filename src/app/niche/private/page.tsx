import { NicheAccess } from "@/components/NicheAccess";
import { NicheChat } from "@/components/NicheChat";
export default function NichePrivatePage() { return <NicheAccess><NicheChat room="personal" title="Private room" intro="A separate, password-gated conversation space." /></NicheAccess>; }
