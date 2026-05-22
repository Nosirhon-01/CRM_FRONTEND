const API_URL = 'http://localhost:3000/api/v1';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const throwApiError = async (response) => {
  let message = `Error: ${response.status}`;
  try {
    const data = await response.json();
    message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || message;
  } catch {
    // keep status fallback
  }
  throw new Error(message);
};

/**
 * Student submits homework
 * payload: { homework_id, student_id, title, file? }
 */
export const submitHomeworkAnswer = async ({ homework_id, student_id, title, file }) => {
  const formData = new FormData();
  formData.append('homework_id', String(homework_id));
  formData.append('student_id', String(student_id));
  formData.append('title', title);
  if (file) formData.append('file', file);

  const response = await fetch(`${API_URL}/homework-answer`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) await throwApiError(response);
  return response.json();
};

/**
 * Teacher fetches all submissions for a homework
 */
export const getSubmissionsByHomework = async (homeworkId) => {
  const response = await fetch(`${API_URL}/homework-answer/homework/${homeworkId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response);
  return response.json();
};

/**
 * Check if student already submitted a homework
 */
export const checkSubmission = async (homeworkId, studentId) => {
  const response = await fetch(
    `${API_URL}/homework-answer/check?homework_id=${homeworkId}&student_id=${studentId}`,
    { headers: getAuthHeaders() },
  );
  if (!response.ok) await throwApiError(response);
  return response.json();
};

/**
 * Get homework verification details for a submission
 */
export const getVerificationDetails = async (answerId) => {
  const response = await fetch(`${API_URL}/homework-answer/verify/${answerId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response);
  return response.json();
};

/**
 * Get full homework verification data including file count
 */
export const getFullVerificationData = async (answerId) => {
  const response = await fetch(`${API_URL}/homework-answer/verify-full/${answerId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response);
  return response.json();
};

/**
 * Teacher grades a submission
 * payload: { score?, comment?, status? }
 */
export const gradeSubmission = async (answerId, payload) => {
  const response = await fetch(`${API_URL}/homework-answer/result/${answerId}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response);
  return response.json();
};

export default {
  submitHomeworkAnswer,
  getSubmissionsByHomework,
  checkSubmission,
  getVerificationDetails,
  getFullVerificationData,
  gradeSubmission,
};
