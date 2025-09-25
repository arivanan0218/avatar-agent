from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, RoomOutputOptions
from livekit.plugins import (
    openai,
    cartesia,
    deepgram,
    noise_cancellation,
    silero,
    anam
)
# Removed hedra and PIL imports as we're now using Anam AI
import os
load_dotenv()

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="You are a helpful AI assistant providing detailed information about the iPhone, including its features, specifications, pricing, and customer benefits.")
async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=cartesia.TTS(model="sonic-2", voice="f786b574-daa5-4673-aa0c-cbe3e8534c02"),
        vad=silero.VAD.load(),
        # Removed MultilingualModel() to avoid timeout - using default turn detection
    )
    
    # Initialize and start Anam AI avatar
    persona_config = anam.PersonaConfig(
        name="AI Assistant",
        avatarId="071b0286-4cce-4808-bee2-e642f1062de3"  # You can replace this with a specific Anam avatar ID
    )
    avatar = anam.AvatarSession(persona_config=persona_config)
    
    await avatar.start(session, room=ctx.room)

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # For telephony applications, use `BVCTelephony` instead for best results
            noise_cancellation=noise_cancellation.BVC(), 
        ),
        room_output_options=RoomOutputOptions(
            audio_enabled=False,
        )
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance. Speak English"
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))