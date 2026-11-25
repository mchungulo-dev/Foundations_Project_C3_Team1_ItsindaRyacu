import type { MemberFields } from "@/api/members"
import { TextField } from "@/components/text-field"
import { useI18n } from "@/i18n/i18n-context"
import {
  digitsOnly,
  isValidEmail,
  isValidNationalId,
  isValidRwandaPhone,
} from "@/lib/validation"

export type MemberErrors = Record<keyof MemberFields, string>

export const NO_MEMBER_ERRORS: MemberErrors = {
  name: "",
  email: "",
  phone: "",
  nationalId: "",
}

export function useMemberValidation() {
  const { t } = useI18n()

  return (fields: MemberFields): MemberErrors => ({
    name: fields.name.trim() ? "" : t("validation.nameRequired"),
    email: isValidEmail(fields.email) ? "" : t("validation.emailInvalid"),
    phone: isValidRwandaPhone(fields.phone) ? "" : t("validation.phoneInvalid"),
    nationalId: isValidNationalId(fields.nationalId)
      ? ""
      : t("validation.nationalIdInvalid"),
  })
}

type MemberFieldsInputsProps = {
  values: MemberFields
  errors: MemberErrors
  disabled: boolean
  onChange: (values: MemberFields) => void
}

export function MemberFieldsInputs({
  values,
  errors,
  disabled,
  onChange,
}: MemberFieldsInputsProps) {
  const { t } = useI18n()

  return (
    <>
      <TextField
        id="member-name"
        label={t("members.name")}
        autoComplete="off"
        value={values.name}
        onChange={(event) => onChange({ ...values, name: event.target.value })}
        error={errors.name}
        disabled={disabled}
      />
      <TextField
        id="member-email"
        label={t("members.email")}
        type="email"
        inputMode="email"
        autoComplete="off"
        value={values.email}
        onChange={(event) => onChange({ ...values, email: event.target.value })}
        error={errors.email}
        disabled={disabled}
      />
      <TextField
        id="member-phone"
        label={t("members.phone")}
        type="tel"
        inputMode="tel"
        autoComplete="off"
        placeholder="0788 123 456"
        value={values.phone}
        onChange={(event) => onChange({ ...values, phone: event.target.value })}
        error={errors.phone}
        disabled={disabled}
      />
      <TextField
        id="member-national-id"
        label={t("members.nationalId")}
        inputMode="numeric"
        autoComplete="off"
        value={values.nationalId}
        onChange={(event) =>
          onChange({
            ...values,
            nationalId: digitsOnly(event.target.value, 16),
          })
        }
        error={errors.nationalId}
        disabled={disabled}
      />
    </>
  )
}
