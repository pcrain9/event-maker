type ScheduleSkeletonProps = {
	days?: number;
	sessionsPerDay?: number;
};

export default function ScheduleSkeleton({
	days = 2,
	sessionsPerDay = 3,
}: ScheduleSkeletonProps) {
	const skeletonDays = Array.from({ length: days });
	const skeletonSessions = Array.from({ length: sessionsPerDay });

	return (
		<>
			{skeletonDays.map((_, dayIndex) => (
				<div
					key={`day-${dayIndex}`}
					className="schedule__day schedule__day--skeleton"
				>
					<div className="schedule__day-header">
						<div className="schedule__skeleton schedule__skeleton--label" />
						<div className="schedule__skeleton schedule__skeleton--date" />
					</div>
					<div className="schedule__sessions">
						{skeletonSessions.map((_, sessionIndex) => (
							<div key={`session-${sessionIndex}`} className="schedule__card">
								<div className="schedule__summary">
									<div className="schedule__skeleton schedule__skeleton--avatar" />
									<div className="schedule__skeleton-block">
										<div className="schedule__skeleton schedule__skeleton--line" />
										<div className="schedule__skeleton schedule__skeleton--title" />
									</div>
								</div>
								<div className="schedule__skeleton schedule__skeleton--details" />
							</div>
						))}
					</div>
				</div>
			))}
		</>
	);
}
