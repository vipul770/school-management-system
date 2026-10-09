def dispatch_task(task, *args, **kwargs):
    """Queue work with Celery; execute the small local-development fallback inline if Redis is down."""
    try:
        return task.delay(*args, **kwargs)
    except Exception:
        return task.apply(args=args, kwargs=kwargs, throw=False)
