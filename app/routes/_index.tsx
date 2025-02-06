import { useLoaderData } from "@remix-run/react"
import electron from "~/electron.server"
import path from "path"
import fs from "fs"
import { MissionData, MissionsProps, Missions } from "~/components/missions"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"


export function loader() {
	if (!process.env.USERPROFILE) {
		throw new Error("USERPROFILE environment variable is not set")
	}
	const userProfilePath = path.resolve(process.env.USERPROFILE || '', "Saved Games", "Frontier Developments", "Elite Dangerous")

	let files: string[] = []
	try {
		files = fs.readdirSync(userProfilePath)
	} catch (error) {
		console.error("Error reading directory:", error)
	}
	// remove from this list any file that does not begin with "Journal." and isn't a .log file
	files = files.filter(file => file.toLowerCase().startsWith("journal.") && file.toLowerCase().endsWith(".log"))
	files = files
		.map(file => ({
			name: file,
			time: fs.statSync(path.join(userProfilePath, file)).mtime.getTime()
		}))
		.sort((a, b) => b.time - a.time)
		.map(file => file.name)
	const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
	files = files.filter(file => {
		const filePath = path.join(userProfilePath, file)
		const fileTime = fs.statSync(filePath).mtime.getTime()
		return fileTime >= oneWeekAgo
	})
	let activeCMDR = ""
	let missions = []
	let replays = []
	// loop all files, oldest first, line by line
	for (const file of files) {
		const filePath = path.join(userProfilePath, file)
		const lines = fs.readFileSync(filePath, 'utf-8').split("\n")
		for (const line of lines) {
			if (line.startsWith("{")) {
				let data: any
				let validdata: MissionData
				try {
					data = JSON.parse(line)
				} catch (error) {
					console.error("Error parsing JSON:", error)
					continue
				}
				if (data.event === "Commander" ) {
					activeCMDR = data.Name
					console.log("Active CMDR:", activeCMDR)
				}
				if (data.event === "MissionRedirected") {
					const missionIndex = missions.findIndex(mission => mission.MissionID === data.MissionID)
					if (missionIndex !== -1) {
						missions[missionIndex].DestinationSystem = data.NewDestinationSystem
						missions[missionIndex].DestinationStation = data.NewDestinationStation
						missions[missionIndex].Completed = true
					} else {
						console.error("MissionRedirected event for unknown mission ID:", data.MissionID)
						// add to replays
						replays.push(data)
					}
				}
				if (data.event === "MissionAccepted") {
					validdata = {
						faction: data.Faction,
						name: data.Name,
						localisedName: data.LocalisedName,
						TargetType: data.TargetType,
						TargetType_Localised: data.TargetType_Localised,
						TargetFaction: data.TargetFaction,
						KillCount: data.KillCount,
						DestinationSystem: data.DestinationSystem,
						DestinationStation: data.DestinationStation,
						Expiry: data.Expiry,
						Wing: data.Wing,
						Reputation: data.Reputation,
						Reward: data.Reward,
						MissionID: data.MissionID,
						Kills: 0,
						CMDR: activeCMDR,
						Completed: false,
					}
					missions.push(validdata)
				}
			}
		}
	}
	// loop replays and update missions
	for (const replay of replays) {
		const missionIndex = missions.findIndex(mission => mission.MissionID === replay.MissionID)
		if (missionIndex !== -1) {
			missions[missionIndex].DestinationSystem = replay.NewDestinationSystem
			missions[missionIndex].DestinationStation = replay.NewDestinationStation
			missions[missionIndex].Completed = true
		} else {
			console.error("MissionRedirected event could not be replayed for unknown mission ID:", replay.MissionID)
		}
	}
	const fileContents = files.map(file => {
		const filePath = path.join(userProfilePath, file)
		return {
			name: file,
			content: fs.readFileSync(filePath, 'utf-8')
		}
	})

	let p = 0
	for (const mission of missions) {
		p += mission.KillCount
	}
	return {
		missions: missions,
		totalKills: p,
		missionsCount: missions.length,
		missionsLeft: missions.filter(mission => mission.Completed === false).length,
	}
}

export default function Index() {
	const data = useLoaderData<typeof loader>()
	return (
		<main>
			<span>
				<h1>Elite Dangerous Mission Tracker</h1>
				<button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                    Refresh
                </button>
			</span>
			<p>Active missions: {data.missionsCount}</p>
			<p>Missions left: {data.missionsLeft}</p>
			<p>Total kills: {data.totalKills}</p>
			<h2>Missions:</h2>
			<Missions items={data.missions} />
		</main>
	)
}
