/** Replaces {player} / {partner} placeholders used by user-editable game texts. */
export function fillPlayerTemplate(template: string, playerName: string, partnerName: string): string {
  return template.replaceAll("{player}", playerName).replaceAll("{partner}", partnerName);
}
