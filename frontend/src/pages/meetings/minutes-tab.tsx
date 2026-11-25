import { useState } from "react"
import { saveMinutes } from "@/api/meetings"
import type { Meeting } from "@/api/types"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/i18n-context"

type MinutesTabProps = {
  meeting: Meeting
  canEdit: boolean
  onSaved: () => void
}

export function MinutesTab({ meeting, canEdit, onSaved }: MinutesTabProps) {
  const { t } = useI18n()
  const [text, setText] = useState(meeting.minutes ?? "")
  const [failure, setFailure] = useState<unknown>(null)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  if (!canEdit) {
    return (
      <Card>
        <CardContent>
          {meeting.minutes ? (
            <p className="whitespace-pre-wrap">{meeting.minutes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("meetings.minutesEmpty")}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  async function save() {
    setFailure(null)
    setMessage("")
    if (!text.trim()) {
      setMessage(t("meetings.minutesRequired"))
      return
    }
    setSending(true)
    try {
      await saveMinutes(meeting.meeting_id, text)
      setMessage(t("meetings.minutesSaved"))
      onSaved()
    } catch (caught) {
      setFailure(caught)
    }
    setSending(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <Label htmlFor="minutes">{t("meetings.minutes")}</Label>
        <Textarea
          id="minutes"
          rows={10}
          value={text}
          placeholder={t("meetings.minutesHint")}
          disabled={sending}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <FormError error={failure} />
      {message ? (
        <p role="status" className="rounded-lg bg-secondary p-4 text-sm">
          {message}
        </p>
      ) : null}
      <Button className="w-full sm:w-auto" disabled={sending} onClick={save}>
        {t(sending ? "profile.saving" : "meetings.saveMinutes")}
      </Button>
    </div>
  )
}
