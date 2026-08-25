function notFound() {
  return { status: 404, body: { error: "publish_job_not_found" } };
}

function conflict(error) {
  return { status: 409, body: { error: error.message } };
}

function assertPublishJobOpen(job) {
  if (["published", "cancelled"].includes(job.status)) {
    throw new Error(`X publish job is already ${job.status}`);
  }
}

async function mutatePublishJob({ publishJobId, repository, mutate }) {
  const job = await repository.getPublishJobById(publishJobId);
  if (!job) {
    return notFound();
  }

  try {
    const updatedJob = mutate(job);
    await repository.savePublishJob(updatedJob);
    return { status: 200, body: { publishJob: updatedJob } };
  } catch (error) {
    return conflict(error);
  }
}

export async function handleMarkPublishJobManualRequiredAsync({ publishJobId, body = {}, repository }) {
  return mutatePublishJob({
    publishJobId,
    repository,
    mutate(job) {
      assertPublishJobOpen(job);
      return {
        ...job,
        status: "manual_required",
        manualReason: body.reason ?? "manual X publish required"
      };
    }
  });
}

export async function handleMarkPublishJobManualPublishedAsync({ publishJobId, body = {}, repository }) {
  return mutatePublishJob({
    publishJobId,
    repository,
    mutate(job) {
      assertPublishJobOpen(job);
      return {
        ...job,
        status: "published",
        publishedAt: body.publishedAt ?? new Date().toISOString()
      };
    }
  });
}

export async function handleCancelPublishJobAsync({ publishJobId, body = {}, repository }) {
  return mutatePublishJob({
    publishJobId,
    repository,
    mutate(job) {
      if (job.status === "published") {
        throw new Error("Published X publish job cannot be cancelled");
      }

      return {
        ...job,
        status: "cancelled",
        cancelReason: body.reason ?? "cancelled by CEO"
      };
    }
  });
}
