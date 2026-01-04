import { relations } from "drizzle-orm/relations";
import { users, sessions, patients, appointments, assessments, sessionNotes, treatmentPlans, invoices, payments, auditLogs, vitalSigns, bodyMarkings, documents, prescribedExercises, exercises, goalProgressLogs, patientGoals, outcomeMeasures, clinicalTemplates, collaborationNotes, referrals } from "./schema";

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	sessions: many(sessions),
	patients: many(patients),
	appointments: many(appointments),
	assessments: many(assessments),
	sessionNotes: many(sessionNotes),
	treatmentPlans: many(treatmentPlans),
	payments: many(payments),
	auditLogs: many(auditLogs),
	vitalSigns: many(vitalSigns),
	bodyMarkings: many(bodyMarkings),
	documents: many(documents),
	prescribedExercises: many(prescribedExercises),
	goalProgressLogs: many(goalProgressLogs),
	outcomeMeasures: many(outcomeMeasures),
	patientGoals: many(patientGoals),
	clinicalTemplates: many(clinicalTemplates),
	collaborationNotes_resolvedBy: many(collaborationNotes, {
		relationName: "collaborationNotes_resolvedBy_users_id"
	}),
	collaborationNotes_authorId: many(collaborationNotes, {
		relationName: "collaborationNotes_authorId_users_id"
	}),
	referrals: many(referrals),
}));

export const patientsRelations = relations(patients, ({one, many}) => ({
	user: one(users, {
		fields: [patients.createdBy],
		references: [users.id]
	}),
	appointments: many(appointments),
	assessments: many(assessments),
	sessionNotes: many(sessionNotes),
	treatmentPlans: many(treatmentPlans),
	invoices: many(invoices),
	vitalSigns: many(vitalSigns),
	bodyMarkings: many(bodyMarkings),
	documents: many(documents),
	prescribedExercises: many(prescribedExercises),
	outcomeMeasures: many(outcomeMeasures),
	patientGoals: many(patientGoals),
	collaborationNotes: many(collaborationNotes),
	referrals: many(referrals),
}));

export const appointmentsRelations = relations(appointments, ({one, many}) => ({
	user: one(users, {
		fields: [appointments.fisioterapisId],
		references: [users.id]
	}),
	patient: one(patients, {
		fields: [appointments.patientId],
		references: [patients.id]
	}),
	sessionNotes: many(sessionNotes),
	invoices: many(invoices),
	bodyMarkings: many(bodyMarkings),
}));

export const assessmentsRelations = relations(assessments, ({one}) => ({
	user: one(users, {
		fields: [assessments.fisioterapisId],
		references: [users.id]
	}),
	patient: one(patients, {
		fields: [assessments.patientId],
		references: [patients.id]
	}),
}));

export const sessionNotesRelations = relations(sessionNotes, ({one}) => ({
	user: one(users, {
		fields: [sessionNotes.fisioterapisId],
		references: [users.id]
	}),
	patient: one(patients, {
		fields: [sessionNotes.patientId],
		references: [patients.id]
	}),
	appointment: one(appointments, {
		fields: [sessionNotes.appointmentId],
		references: [appointments.id]
	}),
}));

export const treatmentPlansRelations = relations(treatmentPlans, ({one}) => ({
	user: one(users, {
		fields: [treatmentPlans.fisioterapisId],
		references: [users.id]
	}),
	patient: one(patients, {
		fields: [treatmentPlans.patientId],
		references: [patients.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	appointment: one(appointments, {
		fields: [invoices.appointmentId],
		references: [appointments.id]
	}),
	patient: one(patients, {
		fields: [invoices.patientId],
		references: [patients.id]
	}),
	payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	user: one(users, {
		fields: [payments.diterimaOleh],
		references: [users.id]
	}),
	invoice: one(invoices, {
		fields: [payments.invoiceId],
		references: [invoices.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const vitalSignsRelations = relations(vitalSigns, ({one}) => ({
	user: one(users, {
		fields: [vitalSigns.recordedBy],
		references: [users.id]
	}),
	patient: one(patients, {
		fields: [vitalSigns.patientId],
		references: [patients.id]
	}),
}));

export const bodyMarkingsRelations = relations(bodyMarkings, ({one}) => ({
	user: one(users, {
		fields: [bodyMarkings.recordedBy],
		references: [users.id]
	}),
	appointment: one(appointments, {
		fields: [bodyMarkings.appointmentId],
		references: [appointments.id]
	}),
	patient: one(patients, {
		fields: [bodyMarkings.patientId],
		references: [patients.id]
	}),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	user: one(users, {
		fields: [documents.uploadedBy],
		references: [users.id]
	}),
	patient: one(patients, {
		fields: [documents.patientId],
		references: [patients.id]
	}),
}));

export const prescribedExercisesRelations = relations(prescribedExercises, ({one}) => ({
	user: one(users, {
		fields: [prescribedExercises.prescribedBy],
		references: [users.id]
	}),
	exercise: one(exercises, {
		fields: [prescribedExercises.exerciseId],
		references: [exercises.id]
	}),
	patient: one(patients, {
		fields: [prescribedExercises.patientId],
		references: [patients.id]
	}),
}));

export const exercisesRelations = relations(exercises, ({many}) => ({
	prescribedExercises: many(prescribedExercises),
}));

export const goalProgressLogsRelations = relations(goalProgressLogs, ({one}) => ({
	user: one(users, {
		fields: [goalProgressLogs.recordedBy],
		references: [users.id]
	}),
	patientGoal: one(patientGoals, {
		fields: [goalProgressLogs.goalId],
		references: [patientGoals.id]
	}),
}));

export const patientGoalsRelations = relations(patientGoals, ({one, many}) => ({
	goalProgressLogs: many(goalProgressLogs),
	user: one(users, {
		fields: [patientGoals.createdBy],
		references: [users.id]
	}),
	patient: one(patients, {
		fields: [patientGoals.patientId],
		references: [patients.id]
	}),
}));

export const outcomeMeasuresRelations = relations(outcomeMeasures, ({one}) => ({
	user: one(users, {
		fields: [outcomeMeasures.recordedBy],
		references: [users.id]
	}),
	patient: one(patients, {
		fields: [outcomeMeasures.patientId],
		references: [patients.id]
	}),
}));

export const clinicalTemplatesRelations = relations(clinicalTemplates, ({one}) => ({
	user: one(users, {
		fields: [clinicalTemplates.createdBy],
		references: [users.id]
	}),
}));

export const collaborationNotesRelations = relations(collaborationNotes, ({one}) => ({
	user_resolvedBy: one(users, {
		fields: [collaborationNotes.resolvedBy],
		references: [users.id],
		relationName: "collaborationNotes_resolvedBy_users_id"
	}),
	user_authorId: one(users, {
		fields: [collaborationNotes.authorId],
		references: [users.id],
		relationName: "collaborationNotes_authorId_users_id"
	}),
	patient: one(patients, {
		fields: [collaborationNotes.patientId],
		references: [patients.id]
	}),
}));

export const referralsRelations = relations(referrals, ({one}) => ({
	user: one(users, {
		fields: [referrals.createdBy],
		references: [users.id]
	}),
	patient: one(patients, {
		fields: [referrals.patientId],
		references: [patients.id]
	}),
}));